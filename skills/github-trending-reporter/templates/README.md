# Email Templates

This directory contains Jinja2 templates for the email report.

- `email.html`: The default template used by `generate_report.py`.

## Customization

You can edit `email.html` to change the layout or style of the email.
The template receives the following variables:
- `date`: String (YYYY-MM-DD)
- `repos`: List of dictionaries containing:
  - `name`
  - `url`
  - `description`
  - `language`
  - `stars_today`
  - `summary_what`
  - `summary_problem`
