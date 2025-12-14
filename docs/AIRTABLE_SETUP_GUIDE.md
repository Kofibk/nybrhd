# Naybourhood.ai Airtable Setup Guide

Complete guide to creating the Airtable base for Naybourhood.ai platform.

## Quick Start

1. Create a new Airtable base named "Naybourhood.ai Platform"
2. Create tables in the order listed below (due to linked field dependencies)
3. Configure fields according to specifications
4. Set up automations for computed fields

---

## Table Creation Order

Create tables in this exact order to handle linked field dependencies:

1. **Companies** (no dependencies)
2. **Users** (links to Companies)
3. **User_Roles** (links to Users)
4. **Developments** (links to Companies)
5. **Campaigns** (links to Companies, Developments)
6. **Creative_Assets** (links to Campaigns)
7. **Ad_Copies** (links to Campaigns)
8. **Campaign_Metrics** (links to Campaigns)
9. **Leads** (links to Campaigns, Companies, Developments, Users)
10. **Lead_Interactions** (links to Leads)
11. **Lead_Sources** (links to Companies)
12. **Automation_Sequences** (links to Companies)
13. **Automation_Messages** (links to Automation_Sequences)
14. **Subscriptions** (links to Companies)
15. **Invoices** (links to Companies, Subscriptions)
16. **Settings** (links to Companies)
17. **Audit_Logs** (links to Users, Companies)

---

## Table Specifications

### 1. Companies

| Field | Type | Options/Notes |
|-------|------|---------------|
| name | Single line text | Required |
| website | URL | |
| industry | Single select | `developer`, `agency`, `brokerage` |
| logo_url | URL | |
| created_at | Created time | |

---

### 2. Users

| Field | Type | Options/Notes |
|-------|------|---------------|
| email | Email | Required, unique |
| full_name | Single line text | Required |
| phone | Phone number | |
| avatar_url | URL | |
| user_type | Single select | `developer`, `agent`, `broker` |
| status | Single select | `active`, `inactive`, `pending` |
| company | Link to Companies | |
| created_at | Created time | |

---

### 3. User_Roles

| Field | Type | Options/Notes |
|-------|------|---------------|
| user | Link to Users | Required |
| role | Single select | `admin`, `manager`, `member` |

---

### 4. Developments

| Field | Type | Options/Notes |
|-------|------|---------------|
| name | Single line text | Required |
| company | Link to Companies | Required |
| location | Single line text | |
| country | Single select | See country list below |
| city | Single line text | |
| total_units | Number (integer) | |
| available_units | Number (integer) | |
| price_from | Currency (£) | |
| price_to | Currency (£) | |
| bedrooms_range | Single line text | e.g., "1-4" |
| status | Single select | `pre-launch`, `live`, `sold-out` |
| description | Long text | |
| image_url | URL | |
| features | Multiple select | `gym`, `pool`, `concierge`, `parking`, `garden`, `balcony`, `security`, `spa` |
| completion_date | Date | |
| created_at | Created time | |

**Country Options:**
- United Kingdom
- UAE
- Saudi Arabia
- Qatar
- Kuwait
- Bahrain
- Oman
- Jordan
- Turkey
- Egypt
- Nigeria
- Ghana
- Kenya
- South Africa

---

### 5. Campaigns

| Field | Type | Options/Notes |
|-------|------|---------------|
| name | Single line text | Required |
| company | Link to Companies | Required |
| development | Link to Developments | |
| user_type | Single select | `developer`, `agent`, `broker` |
| objective | Single select | `leads`, `awareness` |
| status | Single select | `draft`, `pending`, `active`, `paused`, `completed` |
| audience_maturity | Single select | `cold-start`, `warm-data`, `verified-lookalikes` |
| audience_clusters | Multiple select | See clusters below |
| anti_tire_kicker_enabled | Checkbox | |
| target_countries | Multiple select | Same as country list |
| target_cities | Multiple select | See cities below |
| target_regions | Multiple select | `uk`, `middle-east`, `africa` |
| total_budget | Currency (£) | |
| daily_cap | Currency (£) | |
| start_date | Date | |
| end_date | Date | |
| whatsapp_addon | Checkbox | |
| landing_page_url | URL | |
| cta_type | Single select | `learn-more`, `book-viewing`, `submit-offer`, `request-callback`, `book-consultation`, `download-brochure` |
| pixel_id | Single line text | |
| conversion_events | Multiple select | `Lead`, `ViewContent`, `SubmitForm`, `Schedule`, `Contact` |
| utm_campaign | Single line text | |
| utm_source | Single line text | |
| utm_medium | Single line text | |
| meta_campaign_id | Single line text | |
| meta_adset_id | Single line text | |
| meta_ad_ids | Long text | JSON array |
| meta_form_id | Single line text | |
| created_at | Created time | |

**Audience Clusters:**
- Young Professionals
- HNWI
- First-Time Buyers
- Investors
- Downsizers
- Families
- Expats
- Holiday Home Seekers

**Target Cities:**
- London, Manchester, Birmingham, Edinburgh, Leeds
- Dubai, Abu Dhabi, Sharjah
- Riyadh, Jeddah, Dammam
- Doha, Kuwait City, Manama, Muscat
- Amman, Istanbul, Cairo
- Lagos, Abuja, Accra, Nairobi, Johannesburg

---

### 6. Creative_Assets

| Field | Type | Options/Notes |
|-------|------|---------------|
| campaign | Link to Campaigns | Required |
| type | Single select | `static`, `carousel`, `video` |
| file | Attachment | |
| thumbnail_url | URL | |
| file_size_bytes | Number | |
| status | Single select | `pending`, `approved`, `rejected` |
| performance_score | Number (0-100) | |
| created_at | Created time | |

---

### 7. Ad_Copies

| Field | Type | Options/Notes |
|-------|------|---------------|
| campaign | Link to Campaigns | Required |
| headline | Single line text | |
| body | Long text | |
| cta | Single select | `Learn More`, `Book Viewing`, `Get Quote`, `Contact Us`, `Download Brochure` |
| message_angle | Single select | `investment`, `family`, `holiday-home`, `downsizer`, `first-time-buyer` |
| is_ai_generated | Checkbox | |
| performance_score | Number (0-100) | |
| created_at | Created time | |

---

### 8. Campaign_Metrics

| Field | Type | Options/Notes |
|-------|------|---------------|
| campaign | Link to Campaigns | Required |
| date | Date | Required |
| impressions | Number (integer) | |
| clicks | Number (integer) | |
| spend | Currency (£) | |
| leads | Number (integer) | |
| ctr | Percent | Formula: clicks/impressions |
| cpc | Currency (£) | Formula: spend/clicks |
| cpl | Currency (£) | Formula: spend/leads |
| cpm | Currency (£) | Formula: (spend/impressions)*1000 |
| reach | Number (integer) | |
| frequency | Number (2 decimals) | |
| mobile_leads | Number (integer) | |
| desktop_leads | Number (integer) | |
| verified_leads | Number (integer) | |
| high_intent_leads | Number (integer) | |

---

### 9. Leads

| Field | Type | Options/Notes |
|-------|------|---------------|
| campaign | Link to Campaigns | |
| company | Link to Companies | Required |
| development | Link to Developments | |
| full_name | Single line text | Required |
| email | Email | Required |
| phone | Phone number | |
| country | Single select | Same as country list |
| city | Single line text | |
| budget_min | Currency (£) | |
| budget_max | Currency (£) | |
| bedrooms | Single select | `1`, `2`, `3`, `4+` |
| timeline | Single select | `Within 28 days`, `0-3 months`, `3-6 months`, `6-9 months`, `9-12 months`, `12+ months` |
| payment_method | Single select | `cash`, `mortgage`, `investor` |
| property_purpose | Single select | `residence`, `investment`, `holiday` |
| property_value | Currency (£) | Mortgage broker field |
| borrowing_amount | Currency (£) | Mortgage broker field |
| browsing_status | Single select | `browsing`, `active-looking` |
| quality_score | Number (0-100) | |
| intent_score | Number (0-100) | |
| classification | Single select | `hot`, `quality`, `intent`, `valid`, `cold`, `at-risk`, `disqualified` |
| lead_source | Single select | `meta`, `portal`, `website`, `email`, `introducer`, `crm`, `csv` |
| source_detail | Single line text | e.g., "Rightmove" |
| utm_campaign | Single line text | |
| utm_content | Single line text | |
| utm_term | Single line text | |
| device_type | Single select | `mobile`, `desktop`, `tablet` |
| status | Single select | `new`, `contacted`, `qualified`, `viewing-booked`, `offer-made`, `won`, `lost` |
| assigned_agent | Link to Users | |
| notes | Long text | |
| created_at | Created time | |

---

### 10. Lead_Interactions

| Field | Type | Options/Notes |
|-------|------|---------------|
| lead | Link to Leads | Required |
| type | Single select | `form-submit`, `email-open`, `email-click`, `whatsapp-reply`, `call`, `viewing`, `brochure-download`, `offer-submitted` |
| description | Single line text | |
| metadata | Long text | JSON data |
| created_at | Created time | |

---

### 11. Lead_Sources

| Field | Type | Options/Notes |
|-------|------|---------------|
| company | Link to Companies | Required |
| source_type | Single select | `portal`, `website`, `email`, `introducer`, `crm` |
| name | Single line text | |
| config | Long text | JSON config |
| is_active | Checkbox | |
| created_at | Created time | |

---

### 12. Automation_Sequences

| Field | Type | Options/Notes |
|-------|------|---------------|
| company | Link to Companies | Required |
| name | Single line text | Required |
| channel | Single select | `whatsapp`, `email`, `sms` |
| trigger | Single select | `new-lead`, `viewing-booked`, `offer-made`, `manual` |
| target_classifications | Multiple select | `hot`, `quality`, `intent`, `valid`, `cold` |
| is_active | Checkbox | |
| created_at | Created time | |

---

### 13. Automation_Messages

| Field | Type | Options/Notes |
|-------|------|---------------|
| sequence | Link to Automation_Sequences | Required |
| order | Number (integer) | Step order |
| delay_days | Number (integer) | |
| delay_hours | Number (integer) | |
| subject | Single line text | Email only |
| body | Long text | Supports {{variables}} |
| cta_text | Single line text | |
| cta_url | URL | |
| is_ai_generated | Checkbox | |

---

### 14. Subscriptions

| Field | Type | Options/Notes |
|-------|------|---------------|
| company | Link to Companies | Required |
| plan | Single select | `starter`, `growth`, `enterprise` |
| status | Single select | `active`, `past-due`, `cancelled`, `trial` |
| monthly_fee | Currency (£) | |
| leads_included | Number (integer) | |
| leads_used | Number (integer) | |
| billing_cycle_start | Date | |
| billing_cycle_end | Date | |
| stripe_subscription_id | Single line text | |
| created_at | Created time | |

---

### 15. Invoices

| Field | Type | Options/Notes |
|-------|------|---------------|
| company | Link to Companies | Required |
| subscription | Link to Subscriptions | |
| amount | Currency (£) | |
| status | Single select | `pending`, `paid`, `failed`, `refunded` |
| invoice_date | Date | |
| due_date | Date | |
| paid_at | Date | |
| stripe_invoice_id | Single line text | |
| pdf_url | URL | |

---

### 16. Settings

| Field | Type | Options/Notes |
|-------|------|---------------|
| company | Link to Companies | Required |
| meta_app_id | Single line text | |
| meta_access_token | Single line text | |
| meta_ad_account_id | Single line text | |
| meta_pixel_id | Single line text | |
| whatsapp_phone_id | Single line text | |
| whatsapp_access_token | Single line text | |
| whatsapp_business_id | Single line text | |
| timezone | Single select | `Europe/London`, `Asia/Dubai`, `Africa/Lagos`, `Africa/Cairo` |
| date_format | Single select | `DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY-MM-DD` |
| email_notifications | Checkbox | |
| weekly_report | Checkbox | |

---

### 17. Audit_Logs

| Field | Type | Options/Notes |
|-------|------|---------------|
| user | Link to Users | |
| company | Link to Companies | |
| action | Single select | `create`, `update`, `delete`, `login`, `logout`, `export`, `import` |
| entity_type | Single line text | e.g., "campaign", "lead" |
| entity_id | Single line text | |
| changes | Long text | JSON diff |
| ip_address | Single line text | |
| created_at | Created time | |

---

## Rollup & Formula Fields

After creating all tables, add these computed fields:

### Campaigns Table
- **total_leads**: Rollup from Leads → COUNT
- **total_spend**: Rollup from Campaign_Metrics.spend → SUM
- **avg_cpl**: Formula → `IF(total_leads > 0, total_spend / total_leads, 0)`

### Lead_Sources Table
- **leads_count**: Rollup from Leads → COUNT

### Leads Table
- **combined_score**: Formula → `(quality_score + intent_score) / 2`

---

## Views to Create

### Leads Table Views
1. **All Leads** - Default grid view
2. **Hot Leads** - Filter: classification = "hot"
3. **By Campaign** - Group by campaign
4. **By Status** - Kanban view grouped by status
5. **High Intent** - Filter: intent_score >= 70

### Campaigns Table Views
1. **All Campaigns** - Default grid view
2. **Active** - Filter: status = "active"
3. **By Company** - Group by company
4. **Performance** - Sort by total_leads DESC

---

## Automations

### Lead Classification
When lead is created/updated, run automation:
1. Calculate classification based on quality_score and intent_score
2. Update classification field accordingly

### Lead Scoring Logic
```
IF quality_score >= 80 AND intent_score >= 80 THEN "hot"
ELSE IF quality_score >= 70 THEN "quality"
ELSE IF intent_score >= 70 THEN "intent"
ELSE IF quality_score >= 50 AND intent_score >= 50 THEN "valid"
ELSE IF quality_score < 30 OR intent_score < 30 THEN "at-risk"
ELSE IF quality_score < 20 AND intent_score < 20 THEN "disqualified"
ELSE "cold"
```

---

## API Integration

To connect Airtable to the web app:

1. Get your Airtable API key from Account settings
2. Get your Base ID from the API docs
3. Configure environment variables:
   ```
   AIRTABLE_API_KEY=your_api_key
   AIRTABLE_BASE_ID=your_base_id
   ```

---

## Sample Data

After setup, populate with sample data:

1. Create 2-3 Companies
2. Create 3-5 Users per company
3. Create 2-3 Developments per company
4. Create 2-3 Campaigns per development
5. Create 10-20 Leads per campaign
6. Add Lead_Interactions for engagement history

---

## Security Notes

- Never expose API keys in frontend code
- Use Airtable's view sharing for read-only access
- Implement proper authentication in your backend
- Consider Airtable Sync for real-time updates

---

## Schema Version

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Compatible With:** Naybourhood.ai v1.0

