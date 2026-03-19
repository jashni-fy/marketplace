# frozen_string_literal: true

class Types::MutationType < Types::BaseObject
  description 'Root entry point for mutations'

  field :create_review, mutation: Mutations::CreateReview,
                        description: 'Submit a review for an existing booking'

  # Notification mutations
  field :mark_notification_as_read, mutation: Mutations::MarkNotificationAsRead,
                                    description: 'Mark an in-app notification as read'
  field :update_email_notification_preferences, mutation: Mutations::UpdateEmailNotificationPreferences,
                                                description: 'Update user email notification preferences'

  # Favorites mutations
  field :toggle_favorite, mutation: Mutations::ToggleFavorite,
                          description: 'Add or remove a vendor from user favorites'

  # Review mutations
  field :respond_to_review, mutation: Mutations::RespondToReview,
                            description: 'Vendor response to a review'
  field :vote_review_helpful, mutation: Mutations::VoteReviewHelpful,
                              description: 'Vote a review as helpful'
end
