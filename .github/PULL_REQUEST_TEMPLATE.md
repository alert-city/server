## TL;DR
<!-- Provide a short summary of the changes in this PR. -->
<!-- Example: Fixes a bug in the authentication logic and improves performance in user queries. -->

## Description
<!-- Provide a detailed description of the changes made in this PR. -->
<!-- Explain the problem, how it was solved, and any other context necessary to understand the changes. -->
<!-- Example:
This PR addresses a bug where users were unable to log in with valid credentials due to an issue with the JWT token generation. 
The authentication logic was refactored to ensure tokens are correctly issued. Additionally, query performance was improved by 
optimizing database indexing and refactoring the ORM queries.
-->

## Type of Change
<!-- Check the box that applies to this PR. -->
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes, only code improvements)

## Related Issues
<!-- List any related issues or tickets that this PR resolves or is related to. -->
<!-- Example: 
Fixes #123 
Related to #456 
-->

## How Has This Been Tested?
<!-- Describe how you tested your changes and how you know they are effective. -->
<!-- Example: 
1. Ran unit tests for all affected modules.
2. Manually tested the login process in a staging environment.
3. Added new tests to cover the new logic.
-->

## Screenshots (if applicable)
<!-- Add screenshots or gifs to demonstrate the changes made. -->
<!-- Example: -->
<!-- 
Before:
![Before Screenshot](link_to_image)
After:
![After Screenshot](link_to_image)
-->

## Checklist
<!-- Ensure all items are complete before requesting a review. -->
- [ ] My code follows the style guidelines of this project.
- [ ] I have performed a self-review of my own code.
- [ ] I have commented my code, particularly in hard-to-understand areas.
- [ ] I have made corresponding changes to the documentation.
- [ ] My changes generate no new warnings.
- [ ] I have added tests that prove my fix is effective or that my feature works.
- [ ] New and existing unit tests pass locally with my changes.
- [ ] Any dependent changes have been merged and published in downstream modules.

## Additional Notes
<!-- Add any additional information or context that you think is important. -->
<!-- Example: 
This PR also upgrades the authentication library to the latest version, which includes important security fixes.
-->