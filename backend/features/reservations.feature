
Feature: Reservation Management

  As a faculty user
  I want to create reservations
  So that I can book available resources

  Scenario: Successfully create a reservation
    Given a faculty user is logged in
    And a resource is available
    When the faculty user submits a reservation with valid future dates
    Then the reservation should be created successfully
    And the reservation status should be "pending"

  Scenario: Reject a reservation with an invalid time range
    Given a faculty user is logged in
    And a resource is available
    When the faculty user submits a reservation with an end time before the start time
    Then the reservation should be rejected
    And a validation error should be returned
