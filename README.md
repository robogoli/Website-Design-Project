# CivicBridge

A community resource directory connecting residents of Cumming and Forsyth County, Georgia, with local services, educational opportunities, and community programs.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Problem Being Addressed](#problem-being-addressed)
- [Target Audience](#target-audience)
- [Main Features](#main-features)
- [Technologies](#technologies)
- [Installation Instructions](#installation-instructions)
- [Directory Structure](#directory-structure)
- [Data Sources & Verification](#data-sources--verification)
- [Accessibility & Design Standards](#accessibility--design-standards)
- [AI Assistance Disclosure](#ai-assistance-disclosure)

---

## Project Overview
**CivicBridge** is a community resource directory featuring 165 verified listings across 11 categories (15 per category) for Cumming and Forsyth County, Georgia. Listings include source information, operating hours, direct phone contacts, and verification details.

---

## Problem Being Addressed
Public health studies (such as the Forsyth County Community Health Needs Assessment) reveal that community support services are frequently fragmented across disparate county PDFs, outdated social media pages, and buried municipal listings. Residents facing an immediate need—such as food insecurity, sudden utility shutoffs, or unexpected car repairs—often experience friction when searching for reliable, up-to-date operating hours, direct phone lines, and eligibility guidelines.

CivicBridge solves this by providing:
1. **Centralized Directory**: 165 verified community resource listings (15 per category) across 11 civic and community service domains.
2. **Provider-Specific Eligibility**: Explicit eligibility criteria, intake requirements, and language accessibility displayed for each organization.
3. **Responsive Wayfinding**: Mobile-friendly layout designed for smartphones, desktop computers, tablets, and printable offline caseworker handouts.
4. **Desktop Call Safety**: A polite confirmation dialog on desktop systems that verifies the presence of a calling application (e.g., FaceTime, Skype, Windows Phone Link, Zoom) and automatically copies numbers to the clipboard for phone dialing.

---

## Target Audience
- **Forsyth County Families & Residents**: Searching for local food pantries, emergency utility aid, childcare options, and public school information.
- **Seniors & Caregivers**: Looking for senior center activities, congregate dining, and Meals on Wheels delivery programs.
- **New Residents & Job Seekers**: Seeking library facilities, computer labs, adult education (GED/ESL), and vocational training scholarships.
- **Caseworkers & Social Workers**: Needing a fast, offline-printable reference guide for client appointments and field consultations.

---

## Main Features
- **Instant Search & Autocomplete**: Real-time filtering across names, services, descriptions, and addresses with HTML5 datalist suggestions.
- **Geographic District Filtering**: Refine listings by Forsyth County geographic zones: Central Cumming, North Forsyth, South Forsyth, East Forsyth, and West Forsyth.
- **Sector Category Navigation**: 11 dedicated service domains: Food & Meals, Housing & Utilities, Health & Dental, Schools & Education, Repairs & Maintenance, Childcare & Daycare, Sports & Parks, Local Restaurants, Workforce & Library, Senior Services, and Youth & Family.
- **Interactive Guide (Ask a Neighbor)**: Lightweight client-side directory assistant with word-boundary matching for short keywords, relevance ranking, and provider-specific eligibility displays.
- **Community Events & Gatherings**: Schedule of sample community events with location details, organizer contacts, and district tags.
- **Neighbor Notes Community Board**: Browser-based community feedback system allowing residents to submit updates, verify listing accuracy, or share experiences with optional anonymous attribution saved in local browser storage.
- **Accessibility & Keyboard Navigation**: High-contrast text, visible 3px keyboard focus indicators (`outline: 3px solid #d97706`), semantic landmarks, and skip links.
- **CSS3 Print Stylesheet**: Dedicated `@media print` rules that hide interactive controls and format clean, monochrome handouts for caseworkers.

---

## Technologies
- **Frontend Framework**: React 19 (Functional components, custom hooks)
- **Language**: TypeScript 7.0 (Strict typing, explicit interfaces)
- **Styling**: Tailwind CSS 4.0 + Custom CSS3 Design Tokens
- **Icons**: Lucide React
- **Build Tool**: Vite 8
- **Deployment**: Static single-page application (SPA) hosted on GitHub Pages

---

## Installation Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (version 22.0.0 or higher recommended)
- `npm` (comes with Node.js)

### Local Development Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/robogoli/Website-Design-Project.git
   cd Website-Design-Project
   ```

2. Install dependencies:
   ```bash
   npm ci
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000/Website-Design-Project/
   ```

### Building for Production
To generate an optimized, static production build in the `dist` directory:
```bash
npm run build
```

To run type checks and validate static analysis:
```bash
npm run lint
```

---

## Directory Structure
```
Website-Design-Project/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions automated build and deployment
├── src/
│   ├── assets/
│   │   └── images/               # High-contrast photographic and civic visual assets
│   ├── components/
│   │   ├── Navbar.tsx            # Header, emergency lifeline banner, and tab navigation
│   │   ├── Footer.tsx            # Global footer, device badges, and repository link
│   │   ├── ResourceCard.tsx      # Individual directory listing card component
│   │   ├── ResourceDetails.tsx   # Detailed modal with eligibility, services, and source URLs
│   │   ├── CivicChatbot.tsx      # Interactive guide with keyword ranking and eligibility
│   │   ├── FeedbackSection.tsx   # Community notes board and submission form
│   │   └── EventsSection.tsx     # Local community gatherings and district filters
│   ├── hooks/
│   │   ├── useResources.ts       # Directory filtering, search query, and category state
│   │   └── useFeedback.ts        # Community notes state and localStorage persistence
│   ├── data/
│   │   └── mockData.ts           # 165 verified community resource listings across 11 categories (15 per category)
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces (ResourceItem, DistrictType, etc.)
│   ├── App.tsx                   # Main application coordinator
│   ├── main.tsx                  # React entry point
│   └── index.css                 # CSS3 stylesheet, custom properties, and print styles
├── index.html                    # HTML5 entry document with metadata and font preconnects
├── metadata.json                 # AI Studio descriptive metadata configuration
├── package.json                  # Project dependencies and npm scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite build configuration with base URL
└── README.md                     # Project documentation
```

---

## Data Sources & Verification
Directory entries are compiled from publicly accessible municipal directories, state licensing registries, and community sources:
1. **Forsyth County Government**: Departments of Senior Services, Parks & Recreation, and Public Health ([forsythco.com](https://www.forsythco.com)).
2. **Forsyth County Schools**: Public school district zoning and educational pathways ([forsyth.k12.ga.us](https://www.forsyth.k12.ga.us)).
3. **Forsyth County Public Library**: Branch locations, digital resource centers, and adult literacy programs ([forsythpl.org](https://www.forsythpl.org)).
4. **Georgia Department of Early Care and Learning (DECAL)**: Childcare licensing and CAPS program subsidies ([decal.ga.gov](https://decal.ga.gov)).
5. **Community Non-Profits**: The Place of Forsyth County, Meals by Grace, Good Shepherd Clinic, Bald Ridge Lodge, Jesse's House, and United Way of Forsyth.
6. **Georgia Open Records Act**: Factual agency contacts, public hours, and physical addresses referenced under O.C.G.A. § 50-18-70.

Verified resource items explicitly record their primary source URL (`sourceUrl`), the date verified (`verificationDate`), and verification source body (`verificationSource`).

---

## Accessibility & Design Standards
- **Keyboard Focus**: Distinct 3px amber focus rings (`outline: 3px solid #d97706; outline-offset: 3px;`) across all interactive elements (`button`, `a`, `input`, `select`, `textarea`).
- **Color Contrast**: High-contrast text ratios designed for readability on neutral backgrounds.
- **Responsive Layout**: Designed for mobile smartphones, tablets, desktop displays, and CSS3 print media.
- **Escape Key Handling**: All dialogs and modal windows close reliably when the `Escape` key is pressed or when clicking outside the dialog.

---

## AI Assistance Disclosure
Google AI Studio was utilized to assist in generating boilerplate code, refining component modularity, and formatting documentation. Code structure, responsive styling, and accessibility features have been tested and verified for build integrity. All 165 community listings and local events are verified against authentic municipal and county provider directories.
