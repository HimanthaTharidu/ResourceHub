Feature: Resource Management
  As a ResourceHub user
  I want resource management to follow role-based access control
  So that only administrators can manage resources

  Scenario: Administrator creates a resource successfully
    Given the user is logged in as an administrator
    When the administrator submits valid resource details
    Then the resource should be created successfully
    And the response status should be 201

  Scenario: Faculty member cannot create a resource
    Given the user is logged in as a faculty member
    When the faculty member attempts to create a resource
    Then the resource should not be created
    And the response status should be 403
