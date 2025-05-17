# THRIPHTI.md

## Overview

**Thriphti.com** is a curated platform that connects users with thrift, vintage, resale, and secondhand stores across the Dallas–Fort Worth metroplex. It is designed to be both consumer-facing and merchant-friendly, eventually enabling store owners to manage their own profiles and listings.

The platform includes:

* A public directory of thrift stores
* A map-based and searchable discovery interface
* Store profile pages with rich metadata (hours, contact, location, category tags)
* User-submitted content (suggest a store, leave reviews)
* Admin approval workflows for new submissions
* A future mobile companion app
* Plans for monetization via advertising and featured placements

---

## Tech Stack

| Layer          | Technology                                    |
| -------------- | --------------------------------------------- |
| Frontend       | React (via Lovable.dev)                       |
| Backend/API    | Supabase (Database + Auth + Edge Functions)   |
| Hosting        | Netlify                                       |
| Authentication | Supabase Auth (email/password and magic link) |
| AI Support     | OpenAI (via Cursor + ChatGPT)                 |
| Map Service    | Leaflet.js or Google Maps API (TBD)           |

---

## Supabase Setup

### Tables

#### 1. `stores`

Stores listed on the platform (public-facing).

```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  location GEOGRAPHY(Point, 4326),
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'TX',
  zip TEXT,
  category TEXT[],
  approved BOOLEAN DEFAULT FALSE,
  submitted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT now()
);
```

#### 2. `profiles`

Extended user data for store owners, admins, and consumers.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('user', 'admin', 'store_owner')) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now()
);
```

#### 3. `store_reviews`

User-submitted store reviews.

```sql
CREATE TABLE store_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  user_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

#### 4. `submissions`

Unapproved store suggestions or edits from users.

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('new_store', 'edit')),
  submitted_data JSONB,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  submitted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT now()
);
```

---

## Supabase Auth

* Users are stored in `auth.users`, extended in `profiles` via the `id`.
* Magic link or email/password logins.
* Role-based access (`user`, `admin`, `store_owner`) controls dashboard access and store-editing permissions.

---

## Page Structure

| Path          | Functionality                                 |
| ------------- | --------------------------------------------- |
| `/`           | Home page with map and search bar             |
| `/stores/:id` | Public store profile with reviews and details |
| `/submit`     | Form to submit new stores or corrections      |
| `/dashboard`  | Store owner dashboard (future)                |
| `/admin`      | Admin approval queue for store submissions    |
| `/login`      | User auth page (magic link or password)       |

---

## API and Client Setup

### Supabase Client (`src/services/supabase.ts`)

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;
```

### Store Fetch Example

```ts
const { data, error } = await supabase
  .from('stores')
  .select('*')
  .eq('approved', true);
```

---

## Admin Workflow

1. User submits a new store or edit → stored in `submissions`
2. Admin reviews via `/admin`
3. On approval, submission data is merged into `stores`
4. Optionally notify user via email

---

## AI Agent Guidelines

When modifying code, AI should:

* Use Supabase for all CRUD operations unless specified otherwise.
* Maintain clear separation between public data (`stores`) and gated content (`profiles`, `submissions`).
* Auto-tag submissions with geolocation when address is available.
* Favor JSON-based submissions (`submissions.submitted_data`) for schema flexibility.
* Use optimistic UI updates where possible (e.g., user adds review before server confirms).

---

## Future Enhancements

* Thrift Store Owner login + profile claim system
* Store image uploads via Supabase Storage
* Featured placement (ads/sponsorships)
* Heatmap view of DFW thrift density
* Mobile app with location alerts
* Public and member-only directory filters

---

## Contribution Guidelines

* All Supabase schema changes must be reflected in this file
* Use cursor-friendly comments for AI agents (e.g., `// @cursor: editable block`)
* All functions must be idempotent and role-secure
* Write interfaces/types for every Supabase interaction
