# THRIPHTI – Unified Project Reference & Product Requirements Document (PRD)

## Overview

**Thriphti.com** is a mobile-first, editorially curated local discovery platform that connects users with garage sales, consignment shops, flea markets, and vintage resale events across the Dallas–Fort Worth metroplex. Designed to feel like a local friend’s recommendation—not a commercial directory—Thriphti blends storytelling, deal-finding, and neighborhood culture into one highly engaging experience.

The long-term roadmap includes:

* Multi-city expansion
* Store-owner managed profiles
* Location-aware mobile alerts
* Paid sponsor integrations

---

## Brand Voice & Design Direction

* Tone: Friendly, editorial, trustworthy
* Feels like: A curated neighborhood newsletter
* Color palette:

  * Forest green `#2F4F4F`
  * Rust orange `#D96E30`
  * Apricot gold `#F6B860`
  * Soft ivory `#FDF9F2`
  * Charcoal `#2B2B2B`
* Fonts:

  * Headlines: DM Serif Display or Playfair Display
  * Body: Inter or Work Sans
* Logo direction: lowercase “thriphti”, minimalist serif/sans hybrid

---

## Tech Stack

| Layer         | Technology                                    |
| ------------- | --------------------------------------------- |
| Frontend      | React + TypeScript via Lovable.dev            |
| UI Components | Tailwind CSS + ShadCN UI + Lucide Icons       |
| Animations    | Framer Motion                                 |
| Backend       | Supabase (DB + Auth + Storage)                |
| Hosting       | Netlify                                       |
| Email         | Resend / MailerLite                           |
| Automation    | n8n (AI workflows, notifications, moderation) |
| AI Assistant  | OpenAI (via Cursor + Lovable.dev prompts)     |
| Versioning    | GitHub (connected to Lovable.dev)             |

---

## Supabase Schema Summary

### `stores`

Public-facing thrift and resale store listings.

```sql
id UUID PRIMARY KEY,
name TEXT,
description TEXT,
address TEXT, city TEXT, zip TEXT,
location GEOGRAPHY(Point, 4326),
category TEXT[],
website TEXT, phone TEXT,
approved BOOLEAN DEFAULT FALSE,
submitted_by UUID REFERENCES profiles(id),
created_at TIMESTAMP DEFAULT now()
```

### `profiles`

Extended user data

```sql
id UUID PRIMARY KEY,
email TEXT,
full_name TEXT,
role TEXT CHECK (role IN ('user','admin','store_owner')) DEFAULT 'user',
created_at TIMESTAMP DEFAULT now()
```

### `store_reviews`

User-submitted store reviews

```sql
id UUID PRIMARY KEY,
store_id UUID REFERENCES stores(id),
user_id UUID REFERENCES profiles(id),
rating INTEGER CHECK (rating >=1 AND <=5),
comment TEXT,
status TEXT DEFAULT 'pending',
created_at TIMESTAMP
```

### `submissions`

Unapproved new store submissions

```sql
id UUID,
type TEXT CHECK (type IN ('new_store', 'edit')),
submitted_data JSONB,
status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
submitted_by UUID,
created_at TIMESTAMP
```

### `articles`

Editorial content and guides

```sql
id UUID,
title TEXT, slug TEXT,
body TEXT, excerpt TEXT,
tags TEXT[], city TEXT,
author TEXT, image_url TEXT,
is_featured BOOLEAN,
published_at TIMESTAMP
```

### `favorites`

Saved stores by users

```sql
user_id UUID, store_id UUID
```

### `email_preferences`

User notification settings

```sql
user_id UUID PRIMARY KEY,
frequency TEXT, cities TEXT[]
```

---

## Page Structure & Routes

| Path              | Functionality                                 |
| ----------------- | --------------------------------------------- |
| `/`               | Homepage: featured deal, hero, filters        |
| `/stores`         | Store index: filterable, searchable grid      |
| `/stores/:id`     | Store profile with map, reviews               |
| `/articles`       | Article index by tag or city                  |
| `/articles/:slug` | Article detail page                           |
| `/submit`         | Store suggestion form                         |
| `/login`          | Magic link auth                               |
| `/admin`          | Admin dashboard for submissions & reviews     |
| `/dashboard`      | Future user dashboard (saved, reviews, prefs) |

---

## User Roles & Capabilities

| Role        | Capabilities                                                            |
| ----------- | ----------------------------------------------------------------------- |
| Visitor     | Browse, read, search, filter, submit store or review (pending approval) |
| Registered  | Save stores, submit reviews (tied to user ID), set email preferences    |
| Admin       | Approve/reject reviews, submissions, publish articles                   |
| Store Owner | (Future) Claim/edit profile, respond to reviews, submit store updates   |

---

## Component Library Modules

* `HeroSection.tsx`
* `FeaturedDealCard.tsx`
* `EventCard.tsx`
* `StoreCard.tsx`
* `CityFilterBar.tsx`
* `ReviewBlock.tsx`
* `BlogPostCard.tsx`
* `UserFavorites.tsx`
* `AdminReviewTable.tsx`
* `StoreClaimForm.tsx`

---

## Content & Moderation Workflow

* All reviews default to `pending`
* Admin moderation required (via `/admin`)
* Store submissions reviewed via `submissions`
* Articles can be drafted in Supabase or AI-assisted (n8n)
* OpenAI summarization for excerpts, SEO, and tag generation

---

## AI Agent Prompts & Best Practices

* Use Supabase client SDK for all read/write
* Do not bypass RLS or public/private data separation
* Use semantic, accessible HTML and Tailwind classes
* Animate major UI blocks with Framer Motion
* Write all component prompts in modular, reusable format

---

## Next Steps

* [ ] Add Articles Index Page and BlogPostCard module
* [ ] Build mobile-friendly nav & filters
* [ ] Complete Admin Panel (review + submissions)
* [ ] Add save/store-to-favorites button + logic
* [ ] Implement claim-store feature for future monetization
* [ ] Configure personalized email digests
* [ ] Build user dashboard for saved stores & review history
* [ ] Finalize brand typography & lowercase logo asset

---

This file serves as the master system reference for AI, frontend development, Supabase schema alignment, and project onboarding across Cursor, Lovable.dev, GitHub, and Netlify.
