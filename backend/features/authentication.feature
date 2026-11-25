Feature: Authentication
  As a ResourceHub user
  I want to create an account and authenticate
  So that I can access the system securely

  Scenario: User signs up with valid details
    Given a new user has valid signup details
    When the user submits the signup form
    Then the account should be created

  Scenario: User cannot log in with an incorrect password
    Given a registered user exists
    When the user logs in with an incorrect password
    Then login should be rejected
