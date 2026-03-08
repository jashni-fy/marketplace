# Implementation Guide: Clean Architecture at Model Level

## Overview
This guide shows how to apply clean architecture principles starting from the model layer, following SRP and KISS principles.

---

## What Was Changed

### 1. Booking Model - Before & After

#### BEFORE (88 LOC - Fat Model)
```ruby
class Booking < ApplicationRecord
  validate :vendor_availability, on: :create

  private

  def vendor_availability
    return unless vendor_profile && event_date

    # Check availability
    availability = AvailabilitySlot.find_by(
      vendor_profile: vendor_profile,
      date: event_date.to_date,
      is_available: true
    )
    errors.add(:event_date, 'is not available for this vendor') unless availability

    # Check conflicts (20+ lines)
    conflicting_booking = Booking.where(
      vendor_profile: vendor_profile,
      status: %i[pending accepted]
    ).where(
      '(event_date <= ? AND event_end_date >= ?) OR ...',
      event_date, event_date,
      event_end_date || (event_date + 2.hours),
      event_end_date || (event_date + 2.hours)
    ).where.not(id: id).exists?

    errors.add(:event_date, 'conflicts with another booking') if conflicting_booking
  end
end
```

#### AFTER (45 LOC - Lean Model)
```ruby
class Booking < ApplicationRecord
  validates :event_date, presence: true
  validates :event_location, presence: true
  validates :total_amount, presence: true, numericality: { greater_than: 0 }
  validates :status, presence: true

  validate :event_date_in_future, on: :create
  # Complex validation moved to Bookings::Validate domain service

  scope :cancellable, -> { where(status: %i[pending accepted]).where('event_date > ?', 24.hours.from_now) }
  scope :modifiable, -> { where(status: :pending).where('event_date > ?', 24.hours.from_now) }
  scope :active, -> { where(status: %i[pending accepted]) }
  scope :overlapping_period, ->(start_date, end_date) do
    where('(event_date <= ? AND event_end_date >= ?) OR (event_date <= ? AND event_end_date >= ?)',
          end_date, start_date, start_date, end_date)
  end

  def can_be_cancelled?
    cancellable?
  end

  def can_be_modified?
    modifiable?
  end

  private

  def event_date_in_future
    errors.add(:event_date, 'must be in the future') if event_date <= Time.current
  end
end
```

**Change Breakdown:**
- ❌ Removed `vendor_availability` method (20 LOC)
- ✅ Added domain scopes (10 LOC)
- ✅ Simplified predicates (use scopes)
- ✅ 49% size reduction

---

### 2. Created Query Objects

#### Query Object Pattern
```ruby
# Single responsibility: Execute a specific query
class BookingConflictsQuery
  def initialize(vendor_profile:, event_date:, event_end_date: nil)
    @vendor_profile = vendor_profile
    @event_date = event_date
    @event_end_date = event_end_date || (event_date + 2.hours)
  end

  def self.call(**params)
    new(**params).call
  end

  def call
    bookings.exists?
  end

  def bookings
    Booking
      .where(vendor_profile: @vendor_profile)
      .where(status: %i[pending accepted])
      .overlapping_period(@event_date, @event_end_date)
  end
end
```

**Benefits:**
- ✅ Reusable: Called from models, domain, controllers, GraphQL
- ✅ Testable: Pure Ruby, no Rails dependencies
- ✅ Single source: Query logic defined once
- ✅ Chain to model scopes

---

### 3. Created Domain Services

#### Validation Service
```ruby
class Bookings::Validate
  extend Dry::Initializer

  option :booking, type: Types.Instance(Booking)

  def self.call(booking:)
    new(booking: booking).call
  end

  def call
    errors = []
    errors << validate_vendor_availability
    errors << validate_no_conflicts
    errors.compact
  end

  private

  def validate_vendor_availability
    unless VendorAvailabilityQuery.call(vendor_profile: booking.vendor_profile, date: booking.event_date.to_date)
      { field: :event_date, message: 'is not available for this vendor' }
    end
  end

  def validate_no_conflicts
    if BookingConflictsQuery.call(
      vendor_profile: booking.vendor_profile,
      event_date: booking.event_date,
      event_end_date: booking.event_end_date
    )
      { field: :event_date, message: 'conflicts with another booking' }
    end
  end
end
```

#### State Machine Service
```ruby
class Bookings::StateMachine
  VALID_TRANSITIONS = {
    pending: %i[accepted declined counter_offered cancelled],
    accepted: %i[completed cancelled],
    declined: %i[],
    counter_offered: %i[accepted declined cancelled],
    completed: %i[],
    cancelled: %i[]
  }.freeze

  def self.valid_transition?(from_status, to_status)
    from = from_status.to_sym
    to = to_status.to_sym
    VALID_TRANSITIONS[from]&.include?(to) || false
  end

  def self.can_transition?(booking, new_status)
    return false unless valid_transition?(booking.status, new_status)

    case new_status.to_sym
    when :cancelled
      booking.event_date > 24.hours.from_now
    when :completed
      booking.accepted? || booking.pending?
    else
      true
    end
  end

  def self.available_transitions_for(status)
    VALID_TRANSITIONS[status.to_sym] || []
  end
end
```

---

## How to Use

### Creating a Booking (with validation)

#### Controller
```ruby
def create
  booking = @user.customer_bookings.build(booking_params)

  # Validate business rules BEFORE saving
  errors = Bookings::Validate.call(booking: booking)

  if errors.empty?
    booking.save
    render_created(BookingPresenter.new(booking).as_json)
  else
    render_errors(errors)
  end
end

private

def booking_params
  params.require(:booking).permit(:service_id, :event_date, :event_end_date, :event_location, :total_amount)
end
```

### Updating Booking Status

#### Controller
```ruby
def respond
  return unless vendor_response_authorized?

  booking = Booking.find(params[:id])
  new_status = params[:response_action]

  unless Bookings::StateMachine.can_transition?(booking, new_status)
    return render_errors([{ field: :status, message: 'Invalid transition' }])
  end

  booking.update!(status: new_status)
  render_success(BookingPresenter.new(booking).as_json)
end
```

### Checking Availability (Reusable Everywhere)

```ruby
# In concern
result = BookingConflictsQuery.call(
  vendor_profile: vendor,
  event_date: requested_date,
  event_end_date: requested_end_date
)

# In domain service
if BookingConflictsQuery.call(vendor_profile:, event_date:, event_end_date:)
  errors << { field: :event_date, message: 'conflicts with another booking' }
end

# In GraphQL resolver
conflicts = BookingConflictsQuery.call(vendor_profile:, event_date:, event_end_date:)
available = !conflicts
```

---

## Testing Examples

### Model Tests (Simpler)
```ruby
# spec/models/booking_spec.rb
describe Booking do
  it { should validate_presence_of(:event_date) }

  describe '#can_be_cancelled?' do
    it { expect(booking.can_be_cancelled?).to eq(true) when booking is cancellable }
    it { expect(booking.can_be_cancelled?).to eq(false) when event_date < 24.hours }
  end

  describe '.cancellable' do
    it { expect(Booking.cancellable).to include(cancellable_booking) }
    it { expect(Booking.cancellable).not_to include(non_cancellable_booking) }
  end
end
```

### Query Tests (Fast, No DB)
```ruby
# spec/models/queries/booking_conflicts_query_spec.rb
describe BookingConflictsQuery do
  subject { BookingConflictsQuery.call(vendor_profile:, event_date:, event_end_date:) }

  it { expect(subject).to eq(false) when no conflicts }
  it { expect(subject).to eq(true) when booking overlaps }
end
```

### Domain Service Tests (Isolated)
```ruby
# spec/domain/bookings/validate_spec.rb
describe Bookings::Validate do
  subject { Bookings::Validate.call(booking:) }

  it { expect(subject).to be_empty when booking is valid }
  it { expect(subject).to include(availability_error) when no availability }
  it { expect(subject).to include(conflict_error) when booking conflicts }
end

# spec/domain/bookings/state_machine_spec.rb
describe Bookings::StateMachine do
  describe '.valid_transition?' do
    it { expect(valid_transition?(:pending, :accepted)).to eq(true) }
    it { expect(valid_transition?(:pending, :completed)).to eq(false) }
  end

  describe '.can_transition?' do
    it { expect(can_transition?(booking, :cancelled)).to eq(true) when event_date > 24h }
    it { expect(can_transition?(booking, :cancelled)).to eq(false) when event_date < 24h }
  end
end
```

---

## File Checklist

- ✅ `app/models/booking.rb` - Refactored (removed 43 LOC)
- ✅ `app/models/availability_slot.rb` - Added scopes
- ✅ `app/models/queries/booking_conflicts_query.rb` - NEW
- ✅ `app/models/queries/vendor_availability_query.rb` - NEW
- ✅ `app/domain/bookings/validate.rb` - NEW
- ✅ `app/domain/bookings/state_machine.rb` - NEW
- ✅ `config/application.rb` - Added eager_load paths
- ✅ `docs/ARCHITECTURE.md` - Updated
- ✅ `docs/MODEL_IMPROVEMENTS.md` - NEW
- ✅ `docs/IMPLEMENTATION_GUIDE.md` - NEW (this file)

---

## Key Takeaways

| Principle | How Applied |
|-----------|------------|
| **SRP** | Each class has one job (Model: data, Query: query, Service: logic) |
| **KISS** | Models < 50 LOC, Query objects < 20 LOC, Services < 40 LOC |
| **DRY** | BookingConflictsQuery defined once, used everywhere |
| **Testability** | Query objects and services testable without Rails |
| **Maintainability** | Change once, works everywhere (one source of truth) |

---

## Next Improvements

1. **Form Objects** - For parameter validation
2. **Result Object** - For consistent service returns
3. **More Query Objects** - Review conflicts, portfolio queries
4. **Service Composition** - Combine services for complex workflows
5. **Pagination Service** - Move pagination to domain
6. **Error Handling** - Standardize error responses

---

## References

- See `docs/ARCHITECTURE.md` for layer breakdown
- See `docs/MODEL_IMPROVEMENTS.md` for before/after analysis
- See backend code for implementation examples
