"""
backend/enable_rls.py
Enables Row Level Security (RLS) on all public tables in PostgreSQL / Supabase,
and configures secure access policies to remediate Supabase Database Linter errors:
- 0013_rls_disabled_in_public
- 0008_rls_enabled_no_policy
"""

import logging
from sqlalchemy import text
from backend.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("drishti.rls")

TABLES = [
    "infrastructure",
    "subscribers",
    "sos_events",
    "zones",
    "risk_scores",
    "weather_readings",
    "field_reports",
    "annual_surveys",
    "alert_logs"
]

POLICIES = [
    # Zones: Public Read
    ("zones", "zones_public_select", "CREATE POLICY zones_public_select ON public.zones FOR SELECT USING (true)"),
    
    # Infrastructure: Public Read
    ("infrastructure", "infrastructure_public_select", "CREATE POLICY infrastructure_public_select ON public.infrastructure FOR SELECT USING (true)"),
    
    # Risk Scores: Public Read
    ("risk_scores", "risk_scores_public_select", "CREATE POLICY risk_scores_public_select ON public.risk_scores FOR SELECT USING (true)"),
    
    # Weather Readings: Public Read
    ("weather_readings", "weather_readings_public_select", "CREATE POLICY weather_readings_public_select ON public.weather_readings FOR SELECT USING (true)"),
    
    # Annual Surveys: Public Read
    ("annual_surveys", "annual_surveys_public_select", "CREATE POLICY annual_surveys_public_select ON public.annual_surveys FOR SELECT USING (true)"),
    
    # Alert Logs: Public Read
    ("alert_logs", "alert_logs_public_select", "CREATE POLICY alert_logs_public_select ON public.alert_logs FOR SELECT USING (true)"),
    
    # Field Reports: Public Read
    ("field_reports", "field_reports_public_select", "CREATE POLICY field_reports_public_select ON public.field_reports FOR SELECT USING (true)"),
    
    # SOS Events: Public Read
    ("sos_events", "sos_events_public_select", "CREATE POLICY sos_events_public_select ON public.sos_events FOR SELECT USING (true)"),
]

PERMISSIVE_POLICIES_TO_DROP = [
    ("field_reports", "field_reports_citizen_insert"),
    ("sos_events", "sos_events_insert"),
    ("subscribers", "subscribers_insert"),
]


def enable_row_level_security():
    """Enable RLS and configure security policies for all tables."""
    if engine.dialect.name != "postgresql":
        print(f"[RLS] Dialect is {engine.dialect.name}; skipping PostgreSQL RLS configuration.")
        return

    with engine.begin() as conn:
        print("[RLS] Enabling Row Level Security on all public tables...")
        for table in TABLES:
            conn.execute(text(f"ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY;"))
            print(f"  ✓ Enabled RLS on public.{table}")

        # Query existing policies to avoid duplicates
        existing_policies = {
            (row[0], row[1])
            for row in conn.execute(text(
                "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';"
            )).fetchall()
        }

        # Drop any flagged overly permissive INSERT policies
        for table, policy_name in PERMISSIVE_POLICIES_TO_DROP:
            if (table, policy_name) in existing_policies:
                conn.execute(text(f"DROP POLICY IF EXISTS {policy_name} ON public.{table};"))
                print(f"  ✓ Dropped permissive policy '{policy_name}' on public.{table}")

        print("\n[RLS] Applying security policies...")
        for table, policy_name, sql in POLICIES:
            if (table, policy_name) in existing_policies:
                print(f"  ℹ Policy '{policy_name}' on public.{table} already exists.")
            else:
                conn.execute(text(sql))
                print(f"  ✓ Created policy '{policy_name}' on public.{table}")

    print("\n[RLS] Successfully secured all public tables in Supabase without overly permissive policies!")


if __name__ == "__main__":
    enable_row_level_security()
