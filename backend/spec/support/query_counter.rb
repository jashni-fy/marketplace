# frozen_string_literal: true

module QueryCounter
  def count_queries(&block)
    count = 0
    counter = ->(*) { count += 1 }
    ActiveSupport::Notifications.subscribed(counter, "sql.active_record", &block)
    count
  end
end
