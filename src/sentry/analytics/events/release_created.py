from __future__ import absolute_import, print_function

from sentry import analytics


class ReleaseCreatedEvent(analytics.Event):
    type = "release.created"

    attributes = (
        analytics.Attribute("user_id", required=False),
        analytics.Attribute("organization_id"),
        analytics.Attribute("project_ids"),
        analytics.Attribute("source", required=False),
        analytics.Attribute("created_status"),
    )


analytics.register(ReleaseCreatedEvent)