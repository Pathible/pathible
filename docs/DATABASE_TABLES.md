Core Database Schema for Pathible
Authentication & User Management

1. profiles (extends Supabase auth.users)
   id (uuid, PK, references auth.users)
   first_name (text)
   last_name (text)
   avatar_url (text, nullable)
   phone (text, nullable)
   date_of_birth (date, nullable)
   created_at (timestamp)
   updated_at (timestamp)

2. user_roles (for admin access - CRITICAL for security)
   id (uuid, PK)
   user_id (uuid, FK to auth.users, unique)
   role (enum: 'admin', 'user')
   created_at (timestamp)
   Note: Must use security definer function has_role() for RLS policies
   Household/Family Structure

3. households
   id (uuid, PK)
   name (text) - e.g., "The Smith Family"
   description (text, nullable)
   image_url (text, nullable)
   primary_contact_id (uuid, FK to profiles)
   subscription_tier (enum: 'free', 'basic', 'premium', 'enterprise')
   subscription_status (enum: 'active', 'trialing', 'past_due', 'cancelled')
   created_at (timestamp)
   updated_at (timestamp)

4. household_memberships
   id (uuid, PK)
   household_id (uuid, FK to households)
   user_id (uuid, FK to profiles)
   relationship (enum: 'owner', 'spouse', 'child', 'parent', 'sibling', 'grandparent', 'grandchild', 'other')
   role (enum: 'admin', 'editor', 'viewer') - permissions within the household
   status (enum: 'active', 'invited', 'inactive')
   joined_at (timestamp)
   created_at (timestamp)
   UNIQUE constraint on (household_id, user_id)

5. household_invitations
   id (uuid, PK)
   household_id (uuid, FK to households)
   email (text)
   invited_by (uuid, FK to profiles)
   relationship (text)
   role (enum: 'admin', 'editor', 'viewer')
   token (text, unique) - for invitation link
   status (enum: 'pending', 'accepted', 'expired', 'cancelled')
   expires_at (timestamp)
   created_at (timestamp)
   Subscription & Billing

6. subscriptions
   id (uuid, PK)
   household_id (uuid, FK to households, unique)
   stripe_customer_id (text, unique, nullable)
   stripe_subscription_id (text, unique, nullable)
   tier (enum: 'free', 'basic', 'premium', 'enterprise')
   status (enum: 'active', 'trialing', 'past_due', 'cancelled')
   current_period_start (timestamp)
   current_period_end (timestamp)
   cancel_at_period_end (boolean, default false)
   created_at (timestamp)
   updated_at (timestamp)
   Heritage Vault

7. vault_documents
   id (uuid, PK)
   household_id (uuid, FK to households)
   uploaded_by (uuid, FK to profiles)
   name (text)
   description (text, nullable)
   file_path (text) - Supabase Storage path
   file_size (bigint) - bytes
   file_type (text) - MIME type
   categories (text[]) - array of category names
   access_level (enum: 'household', 'private', 'shared') - who can see it
   shared_with_users (uuid[]) - array of user IDs if 'shared'
   created_at (timestamp)
   updated_at (timestamp)

8. vault_categories
   id (uuid, PK)
   household_id (uuid, FK to households)
   name (text)
   description (text, nullable)
   created_at (timestamp)
   UNIQUE constraint on (household_id, name)
   Wisdom & Education

9. wisdom_entries
   id (uuid, PK)
   household_id (uuid, FK to households)
   author_id (uuid, FK to profiles)
   title (text)
   content (text) - the main wisdom/story
   category (enum: 'life_lesson', 'memory', 'advice', 'story', 'other')
   tags (text[])
   is_published (boolean, default false)
   shared_with (enum: 'household', 'private', 'descendants') - visibility
   media_urls (text[]) - photos/videos attached
   created_at (timestamp)
   updated_at (timestamp)

10. letters
    id (uuid, PK)
    household_id (uuid, FK to households)
    author_id (uuid, FK to profiles)
    title (text)
    content (text)
    recipient_type (enum: 'specific_person', 'all_children', 'all_grandchildren', 'entire_family', 'custom')
    recipient_ids (uuid[]) - specific user IDs if 'specific_person'
    delivery_condition (enum: 'immediate', 'after_death', 'specific_date', 'milestone')
    delivery_date (timestamp, nullable) - for scheduled delivery
    is_delivered (boolean, default false)
    delivered_at (timestamp, nullable)
    created_at (timestamp)
    updated_at (timestamp)

11. core_beliefs
    id (uuid, PK)
    household_id (uuid, FK to households)
    created_by (uuid, FK to profiles)
    title (text)
    content (text)
    category (enum: 'faith', 'values', 'principles', 'traditions', 'other')
    order_index (integer) - for custom ordering
    created_at (timestamp)
    updated_at (timestamp)
    Legacy Planning

12. legacy_plans
    id (uuid, PK)
    household_id (uuid, FK to households)
    user_id (uuid, FK to profiles)
    trusted_contacts (text)
    guardians (text)
    pet_care (text)
    memorial (text)
    final_message (text)
    is_complete (boolean, default false)
    completion_percentage (integer, default 0)
    created_at (timestamp)
    updated_at (timestamp)
    UNIQUE constraint on (household_id, user_id)

13. key_contacts
    id (uuid, PK)
    household_id (uuid, FK to households)
    legacy_plan_id (uuid, FK to legacy_plans)
    name (text)
    role (text) - e.g., "Executor", "Healthcare Proxy"
    phone (text)
    email (text)
    address (text, nullable)
    notes (text, nullable)
    created_at (timestamp)
    Financial Intelligence

14. financial_accounts
    id (uuid, PK)
    household_id (uuid, FK to households)
    name (text)
    type (enum: 'checking', 'savings', 'investment', 'retirement', 'other')
    institution (text, nullable)
    account_number_encrypted (text, nullable) - last 4 digits only
    balance (decimal)
    currency (text, default 'USD')
    last_updated (timestamp)
    created_at (timestamp)
    updated_at (timestamp)

15. properties
    id (uuid, PK)
    household_id (uuid, FK to households)
    name (text)
    type (enum: 'primary-residence', 'rental-property', 'investment-property', 'land', 'other')
    address (text, nullable)
    estimated_value (decimal)
    purchase_date (date, nullable)
    notes (text, nullable)
    created_at (timestamp)
    updated_at (timestamp)

16. insurance_policies
    id (uuid, PK)
    household_id (uuid, FK to households)
    type (enum: 'life', 'health', 'home', 'auto', 'disability', 'long-term-care', 'other')
    provider (text)
    policy_number_encrypted (text, nullable)
    coverage_amount (decimal)
    premium_amount (decimal)
    premium_frequency (enum: 'monthly', 'quarterly', 'annually')
    beneficiaries (text, nullable)
    expiration_date (date, nullable)
    created_at (timestamp)
    updated_at (timestamp)
    Admin-Managed Content

17. daily_wisdom
    id (uuid, PK)
    text (text)
    reference (text) - e.g., "Proverbs 13:22"
    reflection (text, nullable)
    url (text, nullable) - link to more info
    is_active (boolean, default true)
    display_date (date, nullable) - for scheduled content
    created_by (uuid, FK to profiles)
    created_at (timestamp)
    updated_at (timestamp)

18. educational_articles
    id (uuid, PK)
    title (text)
    slug (text, unique)
    content (text)
    excerpt (text, nullable)
    category (enum: 'foundation', 'mindset', 'giving', 'debt', 'retirement', 'estate-planning', 'stewardship', 'other')
    read_time_minutes (integer)
    featured_image_url (text, nullable)
    status (enum: 'draft', 'published', 'archived')
    view_count (integer, default 0)
    author_id (uuid, FK to profiles)
    published_at (timestamp, nullable)
    created_at (timestamp)
    updated_at (timestamp)

19. smart_suggestions
    id (uuid, PK)
    title (text)
    description (text)
    category (enum: 'retirement', 'education', 'giving', 'tax-strategy', 'insurance', 'estate', 'debt', 'other')
    priority (enum: 'high', 'medium', 'low')
    icon (text) - icon name reference
    eligibility_rules (jsonb, nullable) - conditions for showing this suggestion
    is_active (boolean, default true)
    created_by (uuid, FK to profiles)
    created_at (timestamp)
    updated_at (timestamp)

20. user_suggestions (junction table for personalized suggestions)
    id (uuid, PK)
    user_id (uuid, FK to profiles)
    household_id (uuid, FK to households)
    suggestion_id (uuid, FK to smart_suggestions)
    status (enum: 'active', 'dismissed', 'completed')
    dismissed_at (timestamp, nullable)
    completed_at (timestamp, nullable)
    created_at (timestamp)

21. email_templates
    id (uuid, PK)
    name (text, unique)
    subject (text)
    content (text) - HTML template
    description (text, nullable)
    variables (text[]) - list of template variables like {{first_name}}
    created_at (timestamp)
    updated_at (timestamp)
    Activity & Notifications

22. activity_log
    id (uuid, PK)
    household_id (uuid, FK to households)
    user_id (uuid, FK to profiles)
    action_type (enum: 'document_uploaded', 'wisdom_created', 'letter_written', 'plan_updated', 'member_invited', 'other')
    entity_type (text) - e.g., 'vault_documents', 'wisdom_entries'
    entity_id (uuid, nullable)
    description (text)
    created_at (timestamp)

23. notifications
    id (uuid, PK)
    user_id (uuid, FK to profiles)
    household_id (uuid, FK to households, nullable)
    type (enum: 'invitation', 'letter_delivered', 'reminder', 'system', 'other')
    title (text)
    message (text)
    link (text, nullable)
    is_read (boolean, default false)
    read_at (timestamp, nullable)
    created_at (timestamp)

RLS (Row Level Security) Considerations
All tables should have RLS enabled with policies based on:

User must be authenticated
User must be a member of the household (via household_memberships)
User must have appropriate role/permissions
Admin users checked via has_role(auth.uid(), 'admin') function
For the user_roles table specifically, create a security definer function:

create or replace function public.has_role(\_user_id uuid, \_role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
select exists (
select 1
from public.user_roles
where user_id = \_user_id
and role = \_role
)

$$
;
Storage Buckets
Create Supabase Storage buckets for:

vault-documents - for Heritage Vault files
profile-avatars - for user profile images
household-images - for family photos
wisdom-media - for photos/videos attached to wisdom entries
article-images - for educational content
$$
