import type {
  Creator, Campaign, Video, VideoPerformance,
  InstallRecord, Cost, CreatorMetrics,
} from "@/types";

// Real data sourced from Google Sheets
// Sheet 1 (ID: 1f0dAHqqkIv3MiRyKUxrJ7UsXDNOwWyQ7wp8M9_M0hG0)
//   Finnet tab           → Instagram + YouTube creators (INR costs)
//   aevy tv tab          → AOS agency creators (USD costs, converted @ ₹84)
//   owled - launch campaign tab → Owled agency creators (INR costs)
//   AOS IG insights sourced from Google Drive folder shared by agency
// Sheet 2 (ID: 1-il4V8YW8Fob3NMogIm1db7PvBR4PsfAKGXoShWe5N8) — Wispr × WLDD June 2026
//   Campaign Performance tab → 17 creators (IG + YT), UTM links from Dub
// Owled metrics: likes/comments/reposts scraped live from public IG posts 20 Jun 2026
// Last synced: 22 Jun 2026 · Dub analytics verified via API

const USD_INR = 84;

export const creators: Creator[] = [
  // ── Finnet ────────────────────────────────────────────────────
  {
    id: "c1", name: "Anushka Rathod", handle: "@anushkarathod98",
    platform: "Instagram", tier: "Macro", niche: "Lifestyle / Finance",
    agency: "Finnet", contactEmail: "", status: "Active",
    followers: 1000000, avgViews: 144082, dubLinkSlug: "AnushkaR",
    sheetUrl: "https://www.instagram.com/anushkarathod98/",
  },
  {
    id: "c2", name: "Nidhi Kunwar", handle: "@nidhi_kunwarr",
    platform: "Instagram", tier: "Macro", niche: "Finance / Women in Money",
    agency: "Finnet", contactEmail: "", status: "Active",
    followers: 857000, avgViews: 1590533, dubLinkSlug: "NidhiK",
    sheetUrl: "https://www.instagram.com/nidhi_kunwarr/",
  },
  {
    id: "c3", name: "Ayush Shukla", handle: "@ayushshukl.a",
    platform: "Instagram", tier: "Mid", niche: "Finance / Productivity",
    agency: "Finnet", contactEmail: "", status: "Active",
    followers: 244000, avgViews: 14546, dubLinkSlug: "AyushS",
    sheetUrl: "https://www.instagram.com/ayushshukl.a/",
  },
  {
    id: "c4", name: "Ananya Bagri", handle: "@ananyabagri",
    platform: "Instagram", tier: "Nano", niche: "Finance / Career",
    agency: "Finnet", contactEmail: "", status: "Active",
    followers: 9930, avgViews: 6500, dubLinkSlug: "AnanyaB",
    sheetUrl: "https://www.instagram.com/ananyabagri",
  },
  {
    id: "c5", name: "Jayant (Markets with Jayant)", handle: "@marketswithjayant",
    platform: "Instagram", tier: "Mid", niche: "Stock Market / Finance",
    agency: "Finnet", contactEmail: "", status: "Active",
    followers: 275000, avgViews: 74700, dubLinkSlug: "JayantM",
    sheetUrl: "https://www.instagram.com/marketswithjayant/",
  },
  {
    id: "c6", name: "Shankar Bhalla", handle: "@shankar_unravelled",
    platform: "Instagram", tier: "Macro", niche: "Finance / Economics",
    agency: "Finnet", contactEmail: "", status: "Active",
    followers: 540000, avgViews: 26000, dubLinkSlug: "ShankarB",
    sheetUrl: "https://www.instagram.com/shankar_unravelled/",
  },
  {
    id: "c7", name: "CA Nandini", handle: "@ca_nandini19",
    platform: "YouTube", tier: "Mid", niche: "Chartered Accountancy / Finance",
    agency: "Creator Dream", contactEmail: "", status: "Active",
    followers: 437000, avgViews: 45159, dubLinkSlug: "NandiniA",
    sheetUrl: "https://www.youtube.com/@ca_nandini19/featured",
  },
  // ── AOS ───────────────────────────────────────────────────────
  {
    id: "c8", name: "Aevy TV", handle: "@aevytvdaily",
    platform: "Instagram", tier: "Mid", niche: "News / Finance / Business",
    agency: "AEOS", contactEmail: "", status: "Active",
    followers: 329000, avgViews: 264756, dubLinkSlug: "AevyTV",
    sheetUrl: "https://www.instagram.com/aevytvdaily/",
  },
  {
    id: "c9", name: "Arjun Vaidya", handle: "@abvaidya",
    platform: "Instagram", tier: "Mid", niche: "Business / Entrepreneurship",
    agency: "AEOS", contactEmail: "", status: "Active",
    followers: 374000, avgViews: 27684, dubLinkSlug: "ArjunV",
    sheetUrl: "https://www.instagram.com/abvaidya/?hl=en",
  },
  {
    id: "c10", name: "Maitri Mangal", handle: "@maitrimangal",
    platform: "Instagram", tier: "Mid", niche: "Finance / Lifestyle",
    agency: "AEOS", contactEmail: "", status: "Active",
    followers: 157000, avgViews: 33563, dubLinkSlug: "MaitriM",
    sheetUrl: "https://www.instagram.com/maitrimangal",
  },
  // ── Palak (early batch) ───────────────────────────────────────
  {
    id: "c77", name: "Aarti Samant", handle: "@thesortedgirl",
    platform: "Instagram", tier: "Macro", niche: "Finance / Lifestyle",
    agency: "Palak", contactEmail: "", status: "Active",
    followers: 419000, avgViews: 180000, dubLinkSlug: "AartiS",
    sheetUrl: "https://www.instagram.com/thesortedgirl/",
  },
  {
    id: "c78", name: "Gayatri Agrawal", handle: "@gayatri.tech",
    platform: "Instagram", tier: "Mid", niche: "Tech / Finance",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 210000, avgViews: 53448, dubLinkSlug: "Gayatri",
    sheetUrl: "https://www.instagram.com/gayatri.tech/",
  },
  {
    id: "c79", name: "Anurag Bansal", handle: "@businesswithbansal",
    platform: "YouTube", tier: "Mid", niche: "Business / Finance",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 289000, avgViews: 45271, dubLinkSlug: "Anurag",
    sheetUrl: "https://www.youtube.com/@businesswithbansal",
  },
  {
    id: "c80", name: "Ayush Wadhwa", handle: "@ayushwadhwa",
    platform: "Instagram", tier: "Mid", niche: "Business / Entrepreneurship",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 380000, avgViews: 38676, dubLinkSlug: "Ayush",
    sheetUrl: "https://www.instagram.com/ayushwadhwa/?hl=en",
  },
  {
    id: "c81", name: "Jivraj Sachar", handle: "@jivrajsinghsachar",
    platform: "LinkedIn", tier: "Micro", niche: "Career / Productivity",
    agency: "Palak", contactEmail: "", status: "Active",
    followers: 53000, avgViews: 0, dubLinkSlug: "Jivraj",
    sheetUrl: "https://www.linkedin.com/in/jivrajsinghsachar/",
  },
  {
    id: "c82", name: "Miti Shah", handle: "@miti-shah-content-creator",
    platform: "LinkedIn", tier: "Micro", niche: "Content / Marketing",
    agency: "Palak", contactEmail: "", status: "Active",
    followers: 87000, avgViews: 0, dubLinkSlug: "MitiS",
    sheetUrl: "https://www.linkedin.com/in/miti-shah-content-creator/",
  },
  {
    id: "c83", name: "Ansh Mehra", handle: "@anshmehraofficial",
    platform: "Instagram", tier: "Mid", niche: "Business / Finance",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 255000, avgViews: 109768, dubLinkSlug: "AnshM",
    sheetUrl: "https://www.youtube.com/channel/UCZknyXD-6tETm9aN8GQCi8g",
  },
  {
    id: "c84", name: "Paras Madan", handle: "@parasmadan.in",
    platform: "Instagram", tier: "Mid", niche: "Finance / Career",
    agency: "Palak", contactEmail: "", status: "Active",
    followers: 219000, avgViews: 35912, dubLinkSlug: "ParasM",
    sheetUrl: "https://www.instagram.com/parasmadan.in",
  },
  {
    id: "c85", name: "Anik Jain", handle: "@anikjaindesign",
    platform: "Instagram", tier: "Macro", niche: "Design / Business",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 463000, avgViews: 32000, dubLinkSlug: "AnikJ",
    sheetUrl: "https://www.instagram.com/anikjaindesign/?hl=en",
  },
  {
    id: "c86", name: "Aditya Agrawal", handle: "@aditya-agrawal-95422616a",
    platform: "LinkedIn", tier: "Micro", niche: "Business / Entrepreneurship",
    agency: "Palak", contactEmail: "", status: "Active",
    followers: 40000, avgViews: 0, dubLinkSlug: "AdityaA",
    sheetUrl: "https://www.linkedin.com/in/aditya-agrawal-95422616a/",
  },
  {
    id: "c87", name: "Ishan Sharma", handle: "@IshanSharmaYT",
    platform: "YouTube", tier: "Macro", niche: "Tech / AI / Productivity",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 2150000, avgViews: 99325, dubLinkSlug: "IshanYT",
    sheetUrl: "https://youtu.be/StMC4AU7Bds",
  },
  {
    id: "c88", name: "Vaibhav Sisinity", handle: "@VaibhavSisinity",
    platform: "YouTube", tier: "Macro", niche: "Tech / AI / Productivity",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 726000, avgViews: 139865, dubLinkSlug: "vaibhavyt",
    sheetUrl: "https://www.youtube.com/watch?v=iH5vjVacPG8",
  },
  // ── Owled ─────────────────────────────────────────────────────
  // gommaboy — profile & reel both 404 as of 20 Jun 2026 (account deactivated)
  {
    id: "c11", name: "gommaboy", handle: "@gommaboy",
    platform: "Instagram", tier: "Macro", niche: "Comedy / Entertainment",
    agency: "Owled", contactEmail: "", status: "Paused",
    followers: 0, avgViews: 800000,
    sheetUrl: "https://www.instagram.com/gommaboy/reels/",
  },
  {
    id: "c12", name: "Kartik Sadvij", handle: "@kartiksadvij",
    platform: "Instagram", tier: "Nano", niche: "Comedy / VFX",
    agency: "Owled", contactEmail: "", status: "Active",
    followers: 23000, avgViews: 4640,
    sheetUrl: "https://www.instagram.com/kartiksadvij/",
  },
  {
    id: "c13", name: "Raj Patel", handle: "@rajhere.in",
    platform: "Instagram", tier: "Mid", niche: "AI / Tech",
    agency: "Owled", contactEmail: "", status: "Active",
    followers: 169000, avgViews: 55144,
    sheetUrl: "https://www.instagram.com/rajhere.in/reels/",
  },
  {
    id: "c14", name: "Nitin Sequeira", handle: "@nitinzequeira",
    platform: "Instagram", tier: "Mid", niche: "Comedy / Lifestyle",
    agency: "Owled", contactEmail: "", status: "Active",
    followers: 74000, avgViews: 118893,
    sheetUrl: "https://www.instagram.com/nitinzequeira/reels/",
  },
  {
    id: "c15", name: "Kiran Kumar", handle: "@justkirankumar",
    platform: "Instagram", tier: "Mid", niche: "Travel / Lifestyle",
    agency: "Owled", contactEmail: "", status: "Active",
    followers: 141000, avgViews: 219195,
    sheetUrl: "https://www.instagram.com/justkirankumar/",
  },
  {
    id: "c16", name: "Varun Agarwal", handle: "@varun760",
    platform: "Instagram", tier: "Mid", niche: "Startups / Entrepreneurship",
    agency: "Owled", contactEmail: "", status: "Active",
    followers: 151000, avgViews: 43987,
    sheetUrl: "https://www.instagram.com/varun760/",
  },
  {
    id: "c17", name: "Vishal Dayama", handle: "@dayamaged",
    platform: "Instagram", tier: "Mid", niche: "Writing / Brand Consulting",
    agency: "Owled", contactEmail: "", status: "Active",
    followers: 256000, avgViews: 48011,
    sheetUrl: "https://www.instagram.com/dayamaged/",
  },
  {
    id: "c18", name: "Jay Kapoor", handle: "@jaykapoor.24",
    platform: "Instagram", tier: "Macro", niche: "Tech / Business",
    agency: "Owled", contactEmail: "", status: "Active",
    followers: 609000, avgViews: 171401,
    sheetUrl: "https://www.instagram.com/jaykapoor.24/reels/",
  },
  {
    id: "c19", name: "Pritika Loonia", handle: "@pritika.loonia",
    platform: "Instagram", tier: "Mega", niche: "Productivity / Business",
    agency: "Owled", contactEmail: "", status: "Active",
    followers: 2000000, avgViews: 1271174,
    sheetUrl: "https://www.instagram.com/pritika.loonia/",
  },
  {
    id: "c20", name: "Shivanshu Agrawal", handle: "@shivanshu.agrawal_",
    platform: "Instagram", tier: "Mega", niche: "Stories / Business",
    agency: "Owled", contactEmail: "", status: "Active",
    followers: 2000000, avgViews: 162755,
    sheetUrl: "https://www.instagram.com/shivanshu.agrawal_/",
  },
  // ── LinkedIn — India Launch Kannada Seeding ────────────────
  {
    id: "c21", name: "Anubhav Dubey", handle: "@anubhavdubey",
    platform: "LinkedIn", tier: "Macro", niche: "Entrepreneurship / Food",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 338700, avgViews: 13777,
    sheetUrl: "https://www.linkedin.com/in/anubhavdubey/",
  },
  {
    id: "c22", name: "Shivani Gera", handle: "@shivanigera30",
    platform: "LinkedIn", tier: "Macro", niche: "Productivity / Career",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 201300, avgViews: 57003,
    sheetUrl: "https://www.linkedin.com/in/shivani-gera-71b032146/",
  },
  {
    id: "c23", name: "Anant Sekhsaria", handle: "@anant5",
    platform: "LinkedIn", tier: "Mid", niche: "Tech / Business",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 115400, avgViews: 166064,
    sheetUrl: "https://www.linkedin.com/in/anant5/",
  },
  {
    id: "c24", name: "Parth Sanghvi", handle: "@parth-sanghvi-humour-finance",
    platform: "LinkedIn", tier: "Mid", niche: "Finance / Humour",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 87200, avgViews: 88624,
    sheetUrl: "https://www.linkedin.com/in/parth-sanghvi-humour-finance/",
  },
  {
    id: "c25", name: "CA Rahul Arora", handle: "@rahul-arora29",
    platform: "LinkedIn", tier: "Mid", niche: "Finance / CA",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 55000, avgViews: 5286,
    sheetUrl: "https://www.linkedin.com/in/rahul-arora29/",
  },
  {
    id: "c26", name: "Harinder Singh Pelia", handle: "@harindersinghpelia",
    platform: "LinkedIn", tier: "Micro", niche: "Startups / Growth",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 40700, avgViews: 12345,
    sheetUrl: "https://www.linkedin.com/in/harindersinghpelia/",
  },
  {
    id: "c27", name: "Adityan Kayalakal", handle: "@adityanmktng",
    platform: "LinkedIn", tier: "Micro", niche: "Marketing / Brand",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 31000, avgViews: 44822,
    sheetUrl: "https://www.linkedin.com/in/adityanprofile/",
  },
  {
    id: "c28", name: "Jeet Chandan", handle: "@jeetchandan",
    platform: "LinkedIn", tier: "Micro", niche: "Tech / Productivity",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 28800, avgViews: 3166,
    sheetUrl: "https://www.linkedin.com/in/jeetchandan/",
  },
  {
    id: "c29", name: "Prateek Malpani", handle: "@prateekmalpani",
    platform: "LinkedIn", tier: "Micro", niche: "Tech / Productivity",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 28500, avgViews: 2825,
    sheetUrl: "https://www.linkedin.com/in/prateekmalpani/",
  },
  {
    id: "c30", name: "Saransh Anand", handle: "@saransh-anand",
    platform: "LinkedIn", tier: "Micro", niche: "Business / Trends",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 24300, avgViews: 4325,
    sheetUrl: "https://www.linkedin.com/in/saransh-anand/",
  },
  {
    id: "c31", name: "Rohit Singh", handle: "@rohitsingh1387",
    platform: "LinkedIn", tier: "Micro", niche: "Consulting / Leadership",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 0, avgViews: 6465,
    sheetUrl: "https://www.linkedin.com/in/rohitsingh1387/",
  },
  // ── LinkedIn — Wispr at MTW (Mumbai Tech Week) ─────────────
  {
    id: "c32", name: "Jhalak", handle: "@jhalakkkk",
    platform: "LinkedIn", tier: "Micro", niche: "Jobs / AI",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 37000, avgViews: 22000,
    sheetUrl: "https://www.linkedin.com/in/jobswithjhalak/",
  },
  {
    id: "c33", name: "Rishika Maheshwari", handle: "@rishika-maheswari",
    platform: "LinkedIn", tier: "Micro", niche: "Startups / IIT",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 26000, avgViews: 16000,
    sheetUrl: "https://www.linkedin.com/in/rishika-maheswari-9a996a250/",
  },
  {
    id: "c34", name: "Sagar Kumar", handle: "@sagarkumar9525",
    platform: "LinkedIn", tier: "Mid", niche: "AI / Software Dev",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 52000, avgViews: 32000,
    sheetUrl: "https://www.linkedin.com/in/sagarkumar9525/",
  },
  {
    id: "c35", name: "Suryakant Chaurasiya", handle: "@suryakantchaurasiya",
    platform: "LinkedIn", tier: "Mid", niche: "Startups / Founder",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 52000, avgViews: 3556, dubLinkSlug: "suryakant-chaurasiya",
    sheetUrl: "https://www.linkedin.com/in/suryakantchaurasiya/",
  },
  {
    id: "c36", name: "Bhavya Taneja", handle: "@bhavya-taneja",
    platform: "LinkedIn", tier: "Micro", niche: "Product / Travel",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 20000, avgViews: 8000,
    sheetUrl: "https://www.linkedin.com/in/bhavya-taneja-b08a12105/",
  },
  {
    id: "c37", name: "Jayesh Marathe", handle: "@jayeshmarathe2011",
    platform: "LinkedIn", tier: "Micro", niche: "EV / Infrastructure",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 30000, avgViews: 2000,
    sheetUrl: "https://www.linkedin.com/in/jayeshmarathe2011/",
  },
  {
    id: "c38", name: "Riyasha Jaiswal", handle: "@riyasha-jaiswal",
    platform: "LinkedIn", tier: "Macro", niche: "Tech / Flipkart",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 168000, avgViews: 31000,
    sheetUrl: "https://www.linkedin.com/in/riyasha-jaiswal-765071199/",
  },
  {
    id: "c39", name: "Riya Thukral", handle: "@riyathukral-ic",
    platform: "LinkedIn", tier: "Micro", niche: "Startups / Founder",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 40000, avgViews: 1000,
    sheetUrl: "https://www.linkedin.com/in/riyathukral-ic/",
  },
  {
    id: "c40", name: "Supriya Purohit", handle: "@supriyapurohit27",
    platform: "LinkedIn", tier: "Mid", niche: "Product / Tech",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 58000, avgViews: 978,
    sheetUrl: "https://www.linkedin.com/in/supriyapurohit27/",
  },
  {
    id: "c41", name: "Raunak Yadush", handle: "@raunakyadush",
    platform: "LinkedIn", tier: "Mid", niche: "AI / ML Engineering",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 134000, avgViews: 171895,
    sheetUrl: "https://www.linkedin.com/in/raunakyadush/",
  },
  {
    id: "c42", name: "Vikram Kushwaha", handle: "@vikram-kushwaha",
    platform: "LinkedIn", tier: "Micro", niche: "Dev / Tech Tips",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 19000, avgViews: 60000,
    sheetUrl: "https://www.linkedin.com/in/vikram-kushwaha-73101023a/",
  },
  {
    id: "c43", name: "Yogesh Lakhpatani", handle: "@yogesh-lakhpatani",
    platform: "LinkedIn", tier: "Micro", niche: "AI Product / Growth",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 19000, avgViews: 550,
    sheetUrl: "https://www.linkedin.com/in/yogesh-lakhpatani-172839180/",
  },
  {
    id: "c44", name: "Pratyaksh Sharma", handle: "@pratyaksh-sharma",
    platform: "LinkedIn", tier: "Nano", niche: "Product / OLX",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 10000, avgViews: 9000,
    sheetUrl: "https://www.linkedin.com/in/pratyaksh-sharma-9b308753/",
  },
  {
    id: "c45", name: "Sonali Malhotra", handle: "@sonali-malhotra23",
    platform: "LinkedIn", tier: "Micro", niche: "Marketing / GTM",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 35000, avgViews: 65000,
    sheetUrl: "https://www.linkedin.com/in/sonali-malhotra23/",
  },
  {
    id: "c46", name: "Kriti Khanna", handle: "@kritiiii",
    platform: "LinkedIn", tier: "Micro", niche: "Banking / Product",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 26000, avgViews: 1771,
    sheetUrl: "https://www.linkedin.com/in/kritiiii/",
  },
  {
    id: "c47", name: "Vijay Chollangi", handle: "@vijay-chollangi",
    platform: "LinkedIn", tier: "Macro", niche: "AI / Founder",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 136000, avgViews: 25000,
    sheetUrl: "https://www.linkedin.com/in/vijay-chollangi-3230abcd12271/",
  },
  {
    id: "c48", name: "Avani Rathore", handle: "@avanirathore",
    platform: "LinkedIn", tier: "Macro", niche: "Startups / BCG / IIM",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 126000, avgViews: 143000,
    sheetUrl: "https://www.linkedin.com/in/avanirathore/",
  },
  {
    id: "c49", name: "Aashish Jhunjhunwala", handle: "@aashish-jhunjhunwala",
    platform: "LinkedIn", tier: "Macro", niche: "Finance / BCG / Goldman",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 106000, avgViews: 55000,
    sheetUrl: "https://www.linkedin.com/in/aashish-jhunjhunwala/",
  },
  // ── Coding First — June 2026 (YouTube) ─────────────────────
  {
    id: "c67", name: "Coding with Sagar", handle: "@codingwithsagar",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev",
    agency: "Discovr", contactEmail: "", status: "Active",
    followers: 485000, avgViews: 29228, dubLinkSlug: "codingwithsagar",
    sheetUrl: "https://www.youtube.com/watch?v=2tagcO5v9aw",
  },
  {
    id: "c68", name: "Nishant Chahar", handle: "@nishantchahar",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev",
    agency: "Discovr", contactEmail: "", status: "Active",
    followers: 579000, avgViews: 14912, dubLinkSlug: "nishantchahar",
    sheetUrl: "https://youtu.be/78z_gw5rh6s",
  },
  {
    id: "c69", name: "Saumya Singh", handle: "@saumyasingh",
    platform: "YouTube", tier: "Mid", niche: "Coding / Dev",
    agency: "Discovr", contactEmail: "", status: "Active",
    followers: 195000, avgViews: 5499, dubLinkSlug: "saumyasingh",
    sheetUrl: "https://youtu.be/mJOUQ700KaY",
  },
  {
    id: "c70", name: "Pavan Lalwani", handle: "@pavanlalwani",
    platform: "YouTube", tier: "Mid", niche: "Coding / Dev",
    agency: "Discovr", contactEmail: "", status: "Active",
    followers: 320000, avgViews: 23000, dubLinkSlug: "pavanlalwani",
    sheetUrl: "https://www.youtube.com/watch?v=OrJpkD7XHt0",
  },
  {
    id: "c71", name: "Mehul Mohan", handle: "@mehulmohan",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev",
    agency: "Discovr", contactEmail: "", status: "Active",
    followers: 469000, avgViews: 16219, dubLinkSlug: "mehulmpt",
    sheetUrl: "https://youtu.be/y--xkGbsmZc",
  },
  {
    id: "c72", name: "Sheryians Coding", handle: "@sheryianscoding",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev",
    agency: "Discovr", contactEmail: "", status: "Active",
    followers: 703000, avgViews: 25000,
    sheetUrl: "https://www.youtube.com/@sheryians",
  },
  {
    id: "c73", name: "Engineering Digest", handle: "@engineeringdigest",
    platform: "YouTube", tier: "Mid", niche: "Coding / Engineering",
    agency: "Discovr", contactEmail: "", status: "Active",
    followers: 248000, avgViews: 2184, dubLinkSlug: "engineeringdigest",
    sheetUrl: "https://www.youtube.com/@engineeringdigest",
  },
  {
    id: "c74", name: "Arsh Goyal", handle: "@arshgoyal",
    platform: "YouTube", tier: "Mid", niche: "Coding / Dev / DSA",
    agency: "Discovr", contactEmail: "", status: "Active",
    followers: 280000, avgViews: 2500, dubLinkSlug: "arshgoyal",
    sheetUrl: "https://www.youtube.com/@arshgoyal",
  },
  {
    id: "c75", name: "Code And Bug", handle: "@codeandbug",
    platform: "YouTube", tier: "Nano", niche: "Coding / Dev",
    agency: "Discovr", contactEmail: "", status: "Active",
    followers: 31600, avgViews: 12000, dubLinkSlug: "codeandbug",
    sheetUrl: "https://www.youtube.com/@codeandbug",
  },
  {
    id: "c76", name: "Astro", handle: "@astro-yt",
    platform: "YouTube", tier: "Micro", niche: "Coding / Dev",
    agency: "Discovr", contactEmail: "", status: "Active",
    followers: 79000, avgViews: 2500, dubLinkSlug: "astrokj",
    sheetUrl: "https://youtu.be/TRSfMlEnLJc",
  },
  // ── Wispr × WLDD June 2026 — Instagram ─────────────────────
  {
    id: "c50", name: "infoby_shree", handle: "@infoby_shree",
    platform: "Instagram", tier: "Micro", niche: "Regional / Kannada",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 0, avgViews: 15039, dubLinkSlug: "infobyshree",
    sheetUrl: "https://www.instagram.com/infoby_shree/",
  },
  {
    id: "c51", name: "insta__nirav", handle: "@insta__nirav",
    platform: "Instagram", tier: "Micro", niche: "Regional / Gujarati",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 0, avgViews: 4139, dubLinkSlug: "insta-nirav",
    sheetUrl: "https://www.instagram.com/insta__nirav/",
  },
  {
    id: "c52", name: "kochu.ai", handle: "@kochu.ai",
    platform: "Instagram", tier: "Micro", niche: "Regional / Malayalam",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 0, avgViews: 20168, dubLinkSlug: "kochu-ai",
    sheetUrl: "https://www.instagram.com/kochu.ai/",
  },
  {
    id: "c53", name: "financewithjobi", handle: "@financewithjobi",
    platform: "Instagram", tier: "Micro", niche: "Regional / Finance / Kannada",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0, dubLinkSlug: "financewithjobi",
    sheetUrl: "https://www.instagram.com/financewithjobi/",
  },
  {
    id: "c54", name: "prettymuchbusiness", handle: "@prettymuchbusiness",
    platform: "Instagram", tier: "Mid", niche: "Regional / Business / Kannada",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0, dubLinkSlug: "prettymuchbusiness",
    sheetUrl: "https://www.instagram.com/prettymuchbusiness/",
  },
  // ── Wispr × WLDD June 2026 — YouTube ───────────────────────
  {
    id: "c55", name: "Apple Wale Bhaiya", handle: "@applewale-bhaiya",
    platform: "YouTube", tier: "Micro", niche: "Mac / Gadgets / Hinglish",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 38200, avgViews: 10858, dubLinkSlug: "applewale-bhaiya",
    sheetUrl: "https://youtu.be/KtZwESJLohc",
  },
  {
    id: "c56", name: "ezsnippet", handle: "@ezsnippet",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev / Hinglish",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 810000, avgViews: 157453, dubLinkSlug: "ezsnippet",
    sheetUrl: "https://www.youtube.com/@ezsnippet",
  },
  {
    id: "c57", name: "Vaibhav Kadnar", handle: "@vaibhavkadnar",
    platform: "YouTube", tier: "Macro", niche: "Business / Finance / Hindi",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 7000000, avgViews: 153279, dubLinkSlug: "vaibhavkadnar",
    sheetUrl: "https://youtu.be/szGD3CmhulY",
  },
  {
    id: "c58", name: "bisboworld", handle: "@bisboworld",
    platform: "YouTube", tier: "Macro", niche: "Business / Finance / English",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 871000, avgViews: 48473, dubLinkSlug: "bisboworld",
    sheetUrl: "https://www.youtube.com/@bisboworld",
  },
  {
    id: "c59", name: "Akber Shaikh", handle: "@akbershaikh",
    platform: "YouTube", tier: "Micro", niche: "Coding / Dev / Hinglish",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 96600, avgViews: 23829, dubLinkSlug: "akbershaikh",
    sheetUrl: "https://youtu.be/HgsoWFIaT18",
  },
  {
    id: "c60", name: "WhyBhanshu", handle: "@WhyBhanshu",
    platform: "YouTube", tier: "Macro", niche: "Business / Finance / English",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 101000, avgViews: 6557, dubLinkSlug: "WhyBhanshu",
    sheetUrl: "https://youtu.be/cjp0IXYbw6I",
  },
  {
    id: "c61", name: "Mohammed Fraz", handle: "@mohammedfraz",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev / Hinglish",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 563000, avgViews: 28344,
    sheetUrl: "https://www.youtube.com/@mohammedfraz",
  },
  {
    id: "c62", name: "Think Wings", handle: "@thinkwings",
    platform: "YouTube", tier: "Mid", niche: "Business / Finance / Hindi",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.youtube.com/@thinkwings",
  },
  {
    id: "c63", name: "Full Disclosure", handle: "@fulldisclosureyt",
    platform: "YouTube", tier: "Mid", niche: "Business / Finance / English",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.youtube.com/@fulldisclosureyt",
  },
  {
    id: "c64", name: "Technical Suneja", handle: "@technicalsuneja",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev / Hinglish",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.youtube.com/@technicalsuneja",
  },
  {
    id: "c65", name: "Dhaval Kataria", handle: "@dhavalkataria",
    platform: "YouTube", tier: "Mid", niche: "AI / Business / Hinglish",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.youtube.com/@dhavalkataria",
  },
  {
    id: "c66", name: "Tharun Speaks", handle: "@tharunspeaks",
    platform: "YouTube", tier: "Macro", niche: "Business / Growth / Hinglish",
    agency: "WLDD", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.youtube.com/@tharunspeaks",
  },
];

export const campaigns: Campaign[] = [
  {
    // camp-india total: ₹13,47,000 (Finnet) + ₹1,30,280 (AEOS USD×84) + ₹31,85,321 (Owled)
    //   + ₹0 (LinkedIn Seeding) + ₹23,10,000 (Batch 1) + ₹1,00,000 (Anurag IG Reel 2) = ₹80,98,321
    // Verified by: npm run audit:data
    id: "camp-india",
    name: "Wispr India Launch",
    startDate: "2026-02-01",
    endDate: "2026-06-14",
    totalBudget: 8098321,
    totalSpend: 8098321,
    status: "Ended",
    primaryPlatform: "Multi",
    creatorIds: [
      "c1","c2","c3","c4","c5","c6","c7",           // Finnet
      "c8","c9","c10",                               // AEOS
      "c11","c12","c13","c14","c15","c16","c17","c18","c19","c20", // Owled
      "c21","c22","c23","c24","c25","c26","c27","c28","c29","c30","c31", // LinkedIn Seeding
      "c77","c78","c79","c80","c81","c82","c83","c84","c85","c86", // Batch 1 (Palak/Direct/Social Tag)
    ],
    goal: "India market launch — content seeding across Instagram, YouTube, and LinkedIn via Finnet, AEOS, Owled, organic LinkedIn creators, and Batch 1 (Palak/Direct/Social Tag)",
  },
  {
    // LinkedIn Mumbai Tech Week activation
    id: "camp-mtw",
    name: "Mumbai Tech Week",
    startDate: "2026-05-16",
    endDate: "2026-05-21",
    totalBudget: 522000,
    totalSpend: 522000,
    status: "Ended",
    primaryPlatform: "LinkedIn",
    creatorIds: ["c32","c33","c34","c35","c36","c37","c38","c39","c40","c41","c42","c43","c44","c45","c46","c47","c48","c49"],
    goal: "Mumbai Tech Week activation — LinkedIn creator network posting live from the event with referral links",
  },
  {
    // Merged: WLDD + Coding First + Direct (Ishan, Vaibhav, Anurag YT)
    // Budget: ₹35,00,000 (WLDD est.) + ₹11,82,000 (Coding First) + ₹5,46,000 (Ishan) + ₹8,40,000 (Vaibhav) + ₹6,00,000 (Anurag YT) + ₹1,26,000 (Nandini v92) = ₹67,94,000
    id: "camp-june",
    name: "June 2026",
    startDate: "2026-06-01",
    totalBudget: 6627000,
    totalSpend: 6627000,
    status: "Active",
    primaryPlatform: "Multi",
    creatorIds: [
      "c50","c51","c52","c53","c54","c55","c56","c57","c58","c59","c60","c61","c62","c63","c64","c65","c66", // WLDD
      "c67","c68","c69","c70","c71","c72","c73","c74","c75","c76",  // Coding First
      "c7",  // CA Nandini (second YT video)
      "c87", // Ishan Sharma
      "c88", // Vaibhav Sisinity
      "c79", // Anurag Bansal (YouTube)
    ],
    goal: "Monthly programming — YouTube and Instagram content from coding/dev and regional creator cohorts (WLDD + Coding First)",
  },
  {
    // Placeholder for July programming — first-batch list pending from user
    id: "camp-july",
    name: "July 2026",
    startDate: "2026-07-01",
    totalBudget: 0,
    totalSpend: 0,
    status: "Planned",
    primaryPlatform: "Multi",
    creatorIds: [],
    goal: "July monthly programming — creator list pending",
  },
];

export const videos: Video[] = [
  // ── Finnet — Instagram ──────────────────────────────────────
  {
    id: "v1", creatorId: "c1", creatorName: "Anushka Rathod", campaignId: "camp-india",
    title: "Anushka Rathod",
    url: "https://www.instagram.com/reel/DWoZrPsvVc2/",
    platform: "Instagram", goLiveDate: "2026-03-28", format: "Integration", status: "Live",
  },
  {
    id: "v2", creatorId: "c2", creatorName: "Nidhi Kunwar", campaignId: "camp-india",
    title: "Nidhi Kunwar",
    url: "https://www.instagram.com/reel/DWgtCi1jL5o/",
    platform: "Instagram", goLiveDate: "2026-03-21", format: "Integration", status: "Live",
  },
  {
    id: "v3", creatorId: "c3", creatorName: "Ayush Shukla", campaignId: "camp-india",
    title: "Ayush Shukla",
    url: "https://www.instagram.com/reel/DWglq3fCgjx/",
    platform: "Instagram", goLiveDate: "2026-03-30", format: "Integration", status: "Live",
  },
  {
    id: "v4", creatorId: "c4", creatorName: "Ananya Bagri", campaignId: "camp-india",
    title: "Ananya Bagri",
    url: "https://www.instagram.com/p/DWTz_KNzfU-/",
    platform: "Instagram", goLiveDate: "2026-03-25", format: "Short", status: "Live",
  },
  {
    id: "v5", creatorId: "c5", creatorName: "Jayant (Markets with Jayant)", campaignId: "camp-india",
    title: "Jayant (Markets with Jayant)",
    url: "https://www.instagram.com/p/DWTRiUACMlS/",
    platform: "Instagram", goLiveDate: "2026-03-28", format: "Short", status: "Live",
  },
  {
    id: "v6", creatorId: "c6", creatorName: "Shankar Bhalla", campaignId: "camp-india",
    title: "Shankar Bhalla",
    url: "https://www.instagram.com/reel/DW1XOIsk5J-/",
    platform: "Instagram", goLiveDate: "2026-03-25", format: "Integration", status: "Live",
  },
  // ── Finnet — YouTube ────────────────────────────────────────
  {
    id: "v7", creatorId: "c7", creatorName: "CA Nandini", campaignId: "camp-india",
    title: "give me 8 minutes and you'll never forget anything",
    url: "https://www.youtube.com/watch?v=K119PfYh-KY",
    platform: "YouTube", goLiveDate: "2026-03-25", format: "Integration", status: "Live",
  },
  // ── AOS — Instagram ─────────────────────────────────────────
  {
    id: "v8", creatorId: "c8", creatorName: "Aevy TV", campaignId: "camp-india",
    title: "Aevy TV",
    url: "https://www.instagram.com/reel/DVyTPmuD-XA/",
    platform: "Instagram", goLiveDate: "2026-03-12", format: "Dedicated", status: "Live",
  },
  {
    id: "v9", creatorId: "c9", creatorName: "Arjun Vaidya", campaignId: "camp-india",
    title: "Arjun Vaidya",
    url: "https://www.instagram.com/reel/DWB-g4OgiuS/",
    platform: "Instagram", goLiveDate: "2026-03-17", format: "Integration", status: "Live",
  },
  {
    id: "v10", creatorId: "c10", creatorName: "Maitri Mangal", campaignId: "camp-india",
    title: "Maitri Mangal",
    url: "https://www.instagram.com/reel/DWApCVZjUuj/",
    platform: "Instagram", goLiveDate: "2026-03-18", format: "Integration", status: "Live",
  },
  // ── Batch 1 — Palak / Direct / Social Tag ───────────────────
  {
    id: "v77", creatorId: "c77", creatorName: "Aarti Samant", campaignId: "camp-india",
    title: "Aarti Samant",
    url: "https://www.instagram.com/reel/DWEnV1CjBlS/",
    platform: "Instagram", goLiveDate: "2026-03-19", format: "Integration", status: "Live",
  },
  {
    id: "v78", creatorId: "c78", creatorName: "Gayatri Agrawal", campaignId: "camp-india",
    title: "Gayatri Agrawal",
    url: "https://www.instagram.com/reel/DWd9x0IjxFv/",
    platform: "Instagram", goLiveDate: "2026-03-20", format: "Integration", status: "Live",
  },
  {
    id: "v79", creatorId: "c79", creatorName: "Anurag Bansal", campaignId: "camp-india",
    title: "Anurag Bansal — IG Reel 1",
    url: "https://www.instagram.com/reel/DWEP0bCjA4L/",
    platform: "Instagram", goLiveDate: "2026-03-18", format: "Integration", status: "Live",
  },
  {
    id: "v93", creatorId: "c79", creatorName: "Anurag Bansal", campaignId: "camp-india",
    title: "Anurag Bansal — IG Reel 2",
    url: "https://www.instagram.com/reel/DXrQdcPDKzz/",
    platform: "Instagram", goLiveDate: "2026-05-01", format: "Integration", status: "Live",
  },
  {
    id: "v80", creatorId: "c80", creatorName: "Ayush Wadhwa", campaignId: "camp-india",
    title: "Ayush Wadhwa",
    url: "https://www.instagram.com/reel/DWmAOtKEXNx/",
    platform: "Instagram", goLiveDate: "2026-03-25", format: "Integration", status: "Live",
  },
  {
    id: "v81", creatorId: "c81", creatorName: "Jivraj Sachar", campaignId: "camp-india",
    title: "Jivraj Sachar",
    url: "https://www.linkedin.com/posts/jivrajsinghsachar_i-walk-out-of-almost-every-meeting-with-a-activity-7439276060401348609-yRqb",
    platform: "LinkedIn", goLiveDate: "2026-03-16", format: "Integration", status: "Live",
  },
  {
    id: "v82", creatorId: "c82", creatorName: "Miti Shah", campaignId: "camp-india",
    title: "Miti Shah",
    url: "https://www.linkedin.com/posts/miti-shah-content-creator_the-hardest-part-of-content-creation-isn-activity-7439906181088854016-X9lO",
    platform: "LinkedIn", goLiveDate: "2026-03-18", format: "Integration", status: "Live",
  },
  {
    id: "v83", creatorId: "c83", creatorName: "Ansh Mehra", campaignId: "camp-india",
    title: "Ansh Mehra",
    url: "https://www.instagram.com/reel/DWG3m6-k2lc/",
    platform: "Instagram", goLiveDate: "2026-03-20", format: "Integration", status: "Live",
  },
  {
    id: "v84", creatorId: "c84", creatorName: "Paras Madan", campaignId: "camp-india",
    title: "Paras Madan",
    url: "https://www.instagram.com/reel/DWIrGS6E9ic/",
    platform: "Instagram", goLiveDate: "2026-03-19", format: "Integration", status: "Live",
  },
  {
    id: "v85", creatorId: "c85", creatorName: "Anik Jain", campaignId: "camp-india",
    title: "Anik Jain",
    url: "https://www.instagram.com/reel/DWHBGzbCIVU/",
    platform: "Instagram", goLiveDate: "2026-03-20", format: "Integration", status: "Live",
  },
  {
    id: "v86", creatorId: "c86", creatorName: "Aditya Agrawal", campaignId: "camp-india",
    title: "Aditya Agrawal",
    url: "https://www.linkedin.com/in/aditya-agrawal-95422616a/",
    platform: "LinkedIn", goLiveDate: "2026-03-20", format: "Integration", status: "Live",
  },
  {
    id: "v92", creatorId: "c7", creatorName: "CA Nandini", campaignId: "camp-june",
    title: "This AI Tool is Better Than Claude? The Results will Shock You!",
    url: "https://youtu.be/rFERndCDp28",
    platform: "YouTube", goLiveDate: "2026-06-01", format: "Integration", status: "Live",
  },
  {
    id: "v87", creatorId: "c87", creatorName: "Ishan Sharma", campaignId: "camp-june",
    title: "10 Claude Skills I Can't Live Without",
    url: "https://youtu.be/StMC4AU7Bds",
    platform: "YouTube", goLiveDate: "2026-06-01", format: "Integration", status: "Live",
  },
  {
    id: "v88", creatorId: "c87", creatorName: "Ishan Sharma", campaignId: "camp-june",
    title: "I stopped typing after using this AI tool! Wispr Flow Tutorial",
    url: "https://youtu.be/U9GtEUFCGdE",
    platform: "YouTube", goLiveDate: "2026-04-25", format: "Dedicated", status: "Live",
  },
  {
    id: "v94", creatorId: "c87", creatorName: "Ishan Sharma", campaignId: "camp-june",
    title: "Full Claude Tutorial For Beginners",
    url: "https://youtu.be/Nql-5Ph3xZs",
    platform: "YouTube", goLiveDate: "2026-06-05", format: "Integration", status: "Live",
  },
  {
    id: "v91", creatorId: "c88", creatorName: "Vaibhav Sisinity", campaignId: "camp-june",
    title: "Claude Fable 5 Is Mythos. The Most Powerful AI Ever Made Is Now Public",
    url: "https://www.youtube.com/watch?v=iH5vjVacPG8",
    platform: "YouTube", goLiveDate: "2026-06-01", format: "Integration", status: "Live",
  },
  {
    id: "v89", creatorId: "c79", creatorName: "Anurag Bansal", campaignId: "camp-june",
    title: "IPL's Crazy Money-Making Model Explained",
    url: "https://www.youtube.com/watch?v=MIW5YlwoPlY",
    platform: "YouTube", goLiveDate: "2026-06-01", format: "Integration", status: "Live",
  },
  {
    id: "v90", creatorId: "c79", creatorName: "Anurag Bansal", campaignId: "camp-june",
    title: "Amazon's Big Problem With 10-Minute Delivery",
    url: "https://www.youtube.com/watch?v=eyaQ1zeqNeY",
    platform: "YouTube", goLiveDate: "2026-06-10", format: "Integration", status: "Live",
  },
  // ── Owled — Instagram ───────────────────────────────────────
  {
    id: "v11", creatorId: "c11", creatorName: "gommaboy", campaignId: "camp-india",
    title: "gommaboy",
    url: "https://www.instagram.com/reel/DXok0rJD2GF/",
    platform: "Instagram", goLiveDate: "2026-05-07", format: "Integration", status: "Live",
    confirmedDeleted: true,
  },
  {
    id: "v12", creatorId: "c12", creatorName: "Kartik Sadvij", campaignId: "camp-india",
    title: "Kartik Sadvij",
    url: "https://www.instagram.com/reel/DX9ksZdsCJy/",
    platform: "Instagram", goLiveDate: "2026-05-14", format: "Integration", status: "Live",
  },
  {
    id: "v13", creatorId: "c13", creatorName: "Raj Patel", campaignId: "camp-india",
    title: "Raj Patel",
    url: "https://www.instagram.com/reel/DX4A7wqJTj5/",
    platform: "Instagram", goLiveDate: "2026-05-11", format: "Integration", status: "Live",
  },
  {
    id: "v14", creatorId: "c14", creatorName: "Nitin Sequeira", campaignId: "camp-india",
    title: "Nitin Sequeira",
    url: "https://www.instagram.com/reel/DX_8x-Vznlm/",
    platform: "Instagram", goLiveDate: "2026-05-16", format: "Integration", status: "Live",
  },
  {
    id: "v15", creatorId: "c15", creatorName: "Kiran Kumar", campaignId: "camp-india",
    title: "Kiran Kumar",
    url: "https://www.instagram.com/reel/DX6rL-7BgIU/",
    platform: "Instagram", goLiveDate: "2026-05-12", format: "Integration", status: "Live",
  },
  {
    id: "v16", creatorId: "c16", creatorName: "Varun Agarwal", campaignId: "camp-india",
    title: "Varun Agarwal",
    url: "https://www.instagram.com/p/DYBsQdpGsw1/",
    platform: "Instagram", goLiveDate: "2026-05-22", format: "Integration", status: "Live",
  },
  {
    id: "v17", creatorId: "c17", creatorName: "Vishal Dayama", campaignId: "camp-india",
    title: "Vishal Dayama",
    url: "https://www.instagram.com/reel/DYMUY5VJpVh/",
    platform: "Instagram", goLiveDate: "2026-05-29", format: "Dedicated", status: "Live",
  },
  {
    id: "v18", creatorId: "c18", creatorName: "Jay Kapoor", campaignId: "camp-india",
    title: "Jay Kapoor",
    url: "https://www.instagram.com/reel/DX1uWLxPwwH/",
    platform: "Instagram", goLiveDate: "2026-05-09", format: "Integration", status: "Live",
  },
  {
    id: "v19", creatorId: "c19", creatorName: "Pritika Loonia", campaignId: "camp-india",
    title: "Pritika Loonia",
    url: "https://www.instagram.com/reel/DX34GZnxFAG/",
    platform: "Instagram", goLiveDate: "2026-05-10", format: "Integration", status: "Live",
  },
  {
    id: "v20", creatorId: "c20", creatorName: "Shivanshu Agrawal", campaignId: "camp-india",
    title: "Shivanshu Agrawal",
    url: "https://www.instagram.com/reel/DX6_jZnM3uY/",
    platform: "Instagram", goLiveDate: "2026-05-12", format: "Integration", status: "Live",
  },
  // ── LinkedIn Seeding ────────────────────────────────────────
  { id: "v21", creatorId: "c21", creatorName: "Anubhav Dubey",       campaignId: "camp-india", title: "Anubhav Dubey",       url: "https://www.linkedin.com/posts/anubhavdubey_indore-is-not-bengaluru-tamil-nadu-is-not-share-7456371857936764928-E0Rm/",         platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v22", creatorId: "c22", creatorName: "Shivani Gera",        campaignId: "camp-india", title: "Shivani Gera",        url: "https://www.linkedin.com/posts/shivanigera30_bangalore-has-a-productivity-hack-nobody-ugcPost-7456401431588286464-rPdP/",   platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v23", creatorId: "c23", creatorName: "Anant Sekhsaria",     campaignId: "camp-india", title: "Anant Sekhsaria",     url: "https://www.linkedin.com/posts/anant5_wispr-flow-recently-ran-an-on-ground-campaign-share-7457039757613617152-IO-i/",    platform: "LinkedIn", goLiveDate: "2026-04-21", format: "Integration", status: "Live" },
  { id: "v24", creatorId: "c24", creatorName: "Parth Sanghvi",       campaignId: "camp-india", title: "Parth Sanghvi",       url: "https://www.linkedin.com/posts/parth-sanghvi-humour-finance_siri-and-google-assistant-are-brilliant-pieces-share-7457757975584149504-uHRw/", platform: "LinkedIn", goLiveDate: "2026-04-22", format: "Integration", status: "Live" },
  { id: "v25", creatorId: "c25", creatorName: "CA Rahul Arora",      campaignId: "camp-india", title: "CA Rahul Arora",      url: "https://www.linkedin.com/posts/rahul-arora29_wisprflow-startup-marketing-share-7456336599455256576-w0Xc/",                  platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v26", creatorId: "c26", creatorName: "Harinder Singh Pelia", campaignId: "camp-india", title: "Harinder Singh Pelia", url: "https://www.linkedin.com/posts/harindersinghpelia_i-love-it-when-founders-dont-get-defensive-share-7456610108899352576-TY-1/",  platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v27", creatorId: "c27", creatorName: "Adityan Kayalakal",   campaignId: "camp-india", title: "Adityan Kayalakal",   url: "https://www.linkedin.com/posts/adityanmktng_most-brands-dont-fail-because-they-make-activity-7456338537697705985-zRf9/",    platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v28", creatorId: "c28", creatorName: "Jeet Chandan",        campaignId: "camp-india", title: "Jeet Chandan",        url: "https://www.linkedin.com/posts/jeetchandan_something-ive-been-thinking-about-from-the-share-7456616762650857472-QOEq/",      platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v29", creatorId: "c29", creatorName: "Prateek Malpani",     campaignId: "camp-india", title: "Prateek Malpani",     url: "https://www.linkedin.com/posts/prateekmalpani_ive-been-using-wispr-flow-for-a-bit-now-activity-7456014037730869248-sSNm/",    platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v30", creatorId: "c30", creatorName: "Saransh Anand",       campaignId: "camp-india", title: "Saransh Anand",       url: "https://www.linkedin.com/posts/saransh-anand_lyft-bought-a-startup-just-to-put-ads-on-activity-7457045814855618560-Qbi7/",    platform: "LinkedIn", goLiveDate: "2026-04-21", format: "Integration", status: "Live" },
  { id: "v31", creatorId: "c31", creatorName: "Rohit Singh",         campaignId: "camp-india", title: "Rohit Singh",         url: "https://www.linkedin.com/posts/rohitsingh1387_in-13-years-of-working-with-global-firms-ugcPost-7456008947116900352-h_lz/",     platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  // ── LinkedIn MTW ────────────────────────────────────────────
  { id: "v32", creatorId: "c32", creatorName: "Jhalak",               campaignId: "camp-mtw", title: "Jhalak",               url: "https://www.linkedin.com/posts/jhalakkkk_mumbai-tech-week-was-basically-me-running-activity-7467085372976533504-04cs/",               platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v33", creatorId: "c33", creatorName: "Rishika Maheshwari",   campaignId: "camp-mtw", title: "Rishika Maheshwari",   url: "https://www.linkedin.com/posts/rishika-maheswari-9a996a250_we-all-think-at-150-words-per-minute-but-ugcPost-7467095232984256512-iwri/",   platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v34", creatorId: "c34", creatorName: "Sagar Kumar",          campaignId: "camp-mtw", title: "Sagar Kumar",          url: "https://www.linkedin.com/posts/sagarkumar9525_at-mumbai-tech-week-i-watched-someone-spend-ugcPost-7467868806267301888-0qv_/",          platform: "LinkedIn", goLiveDate: "2026-05-18", format: "Integration", status: "Live" },
  { id: "v35", creatorId: "c35", creatorName: "Suryakant Chaurasiya", campaignId: "camp-mtw", title: "Suryakant",            url: "https://www.linkedin.com/posts/suryakantchaurasiya_i-spent-2-days-at-mumbai-tech-week-surrounded-ugcPost-7467030827537752064-dIKI/",   platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v36", creatorId: "c36", creatorName: "Bhavya Taneja",        campaignId: "camp-mtw", title: "Bhavya Taneja",        url: "https://www.linkedin.com/posts/bhavya-taneja-b08a12105_forget-bangalore-traffic-why-does-noone-share-7466804578894675968-TkJv/",        platform: "LinkedIn", goLiveDate: "2026-05-16", format: "Integration", status: "Live" },
  { id: "v37", creatorId: "c37", creatorName: "Jayesh Marathe",       campaignId: "camp-mtw", title: "Jayesh Marathe",       url: "https://www.linkedin.com/posts/jayeshmarathe2011_i-dont-build-software-i-build-ev-infrastructure-ugcPost-7467175703734824960-_RJp/", platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v38", creatorId: "c38", creatorName: "Riyasha Jaiswal",      campaignId: "camp-mtw", title: "Riyasha",              url: "https://www.linkedin.com/posts/riyasha-jaiswal-765071199_came-back-from-mumbai-tech-week-to-200-messages-activity-7467051342801342465-C4jS/", platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v39", creatorId: "c39", creatorName: "Riya Thukral",         campaignId: "camp-mtw", title: "Riya Thukral",         url: "https://www.linkedin.com/posts/riyathukral-ic_nobody-talks-about-the-most-exhausting-part-activity-7467450644929433601-s1lR/",       platform: "LinkedIn", goLiveDate: "2026-05-18", format: "Integration", status: "Live" },
  { id: "v40", creatorId: "c40", creatorName: "Supriya Purohit",      campaignId: "camp-mtw", title: "Supriya",              url: "https://www.linkedin.com/posts/supriyapurohit27_mumbaitechweek-productmanagement-productdesign-activity-7468536661610758145-ds_i/",     platform: "LinkedIn", goLiveDate: "2026-05-21", format: "Integration", status: "Live" },
  { id: "v41", creatorId: "c41", creatorName: "Raunak Yadush",        campaignId: "camp-mtw", title: "Raunak Yadush",        url: "https://www.linkedin.com/posts/raunakyadush_coding-is-faster-ai-is-share-7468497853850570752-sdD8/",                                  platform: "LinkedIn", goLiveDate: "2026-05-21", format: "Integration", status: "Live" },
  { id: "v42", creatorId: "c42", creatorName: "Vikram Kushwaha",      campaignId: "camp-mtw", title: "Vikram Kushwaha",      url: "https://www.linkedin.com/posts/vikram-kushwaha-73101023a_voice-to-text-never-works-for-developers-share-7467576642287128576-5AbB/",      platform: "LinkedIn", goLiveDate: "2026-05-18", format: "Integration", status: "Live" },
  { id: "v43", creatorId: "c43", creatorName: "Yogesh Lakhpatani",    campaignId: "camp-mtw", title: "Yogesh Lakhpatani",    url: "https://www.linkedin.com/posts/yogesh-lakhpatani-172839180_mumbai-tech-week-gave-me-ideas-a-lot-of-share-7468280443730096128-M5Aq/",    platform: "LinkedIn", goLiveDate: "2026-05-20", format: "Integration", status: "Live" },
  { id: "v44", creatorId: "c44", creatorName: "Pratyaksh Sharma",     campaignId: "camp-mtw", title: "Pratyaksh Sharma",     url: "https://www.linkedin.com/posts/pratyaksh-sharma-9b308753_wisprflow-mumbaitechweek-productivity-share-7467514500750094336-dSqc/",         platform: "LinkedIn", goLiveDate: "2026-05-18", format: "Integration", status: "Live" },
  { id: "v45", creatorId: "c45", creatorName: "Sonali Malhotra",      campaignId: "camp-mtw", title: "Sonali Malhotra",      url: "https://www.linkedin.com/posts/sonali-malhotra23_my-rule-at-conferences-if-you-dont-follow-ugcPost-7467180354051948545-pucF/",          platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v46", creatorId: "c46", creatorName: "Kriti Khanna",         campaignId: "camp-mtw", title: "Kriti Khanna",         url: "https://www.linkedin.com/posts/kritiiii_i-went-to-mumbai-tech-week-looking-for-the-ugcPost-7467195227183886336-obhC/",             platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v47", creatorId: "c47", creatorName: "Vijay Chollangi",      campaignId: "camp-mtw", title: "Vijay Chollangi",      url: "https://www.linkedin.com/posts/vijay-chollangi-3230abcd12271_ai-productivity-artificialintelligence-activity-7467488940661485568-AS56/", platform: "LinkedIn", goLiveDate: "2026-05-18", format: "Integration", status: "Live" },
  { id: "v48", creatorId: "c48", creatorName: "Avani Rathore",        campaignId: "camp-mtw", title: "Avani Rathore",        url: "https://www.linkedin.com/posts/avanirathore_people-who-send-4-minute-voice-notes-at-work-share-7467168795334291458-AC73/",          platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v49", creatorId: "c49", creatorName: "Aashish Jhunjhunwala", campaignId: "camp-mtw", title: "Aashish Jhunjhunwala", url: "https://www.linkedin.com/posts/aashish-jhunjhunwala_at-goldman-and-bcg-i-never-thought-about-activity-7466826146685579264-5axC/",    platform: "LinkedIn", goLiveDate: "2026-05-16", format: "Integration", status: "Live" },
  // ── Wispr × WLDD June 2026 — Instagram ─────────────────────
  { id: "v50", creatorId: "c50", creatorName: "infoby_shree",       campaignId: "camp-june", title: "infoby_shree",         url: "https://www.instagram.com/reel/DZXUbN9qNmI/",               platform: "Instagram", goLiveDate: "2026-06-07", format: "Integration", status: "Live" },
  { id: "v51", creatorId: "c51", creatorName: "insta__nirav",        campaignId: "camp-june", title: "insta__nirav",          url: "https://www.instagram.com/reel/DZXW7oqsqIf/",               platform: "Instagram", goLiveDate: "2026-06-09", format: "Integration", status: "Live" },
  { id: "v52", creatorId: "c52", creatorName: "kochu.ai",            campaignId: "camp-june", title: "kochu.ai",              url: "https://www.instagram.com/reel/DZXSVpBygnD/",               platform: "Instagram", goLiveDate: "2026-06-09", format: "Integration", status: "Live" },
  { id: "v53", creatorId: "c53", creatorName: "financewithjobi",     campaignId: "camp-june", title: "financewithjobi",       url: "https://www.instagram.com/reel/DZmwJA2Jzz_/",               platform: "Instagram", goLiveDate: "2026-06-15", format: "Integration", status: "Live", missingInsightReason: "Agency (Social Tag) has not shared IG insights" },
  { id: "v54", creatorId: "c54", creatorName: "prettymuchbusiness",  campaignId: "camp-june", title: "prettymuchbusiness",    url: "https://www.instagram.com/reel/DZpZdqCRGFy/",               platform: "Instagram", goLiveDate: "2026-06-15", format: "Integration", status: "Live", missingInsightReason: "Agency (Social Tag) has not shared IG insights" },
  // ── Wispr × WLDD June 2026 — YouTube ───────────────────────
  { id: "v55", creatorId: "c55", creatorName: "Apple Wale Bhaiya",   campaignId: "camp-june", title: "10 Mac Apps To Fix 10 Mac Problems!",        url: "https://youtu.be/KtZwESJLohc",                               platform: "YouTube",   goLiveDate: "2026-06-10", format: "Integration", status: "Live" },
  { id: "v56", creatorId: "c56", creatorName: "ezsnippet",           campaignId: "camp-june", title: "VIBE Coding is DEAD 💀",                     url: "https://www.youtube.com/watch?v=G0YnO9rown0",                platform: "YouTube",   goLiveDate: "2026-06-10", format: "Integration", status: "Live" },
  { id: "v57", creatorId: "c57", creatorName: "Vaibhav Kadnar",      campaignId: "camp-june", title: "\"BORING\" Businesses That Are Printing Money", url: "https://youtu.be/szGD3CmhulY",                           platform: "YouTube",   goLiveDate: "2026-06-13", format: "Integration", status: "Live" },
  { id: "v58", creatorId: "c58", creatorName: "bisboworld",          campaignId: "camp-june", title: "Ola's Krutrim AI failure vs Sarvam",         url: "https://youtu.be/uuxdQx9EvVg",                               platform: "YouTube",   goLiveDate: "2026-06-13", format: "Integration", status: "Live" },
  { id: "v59", creatorId: "c59", creatorName: "Akber Shaikh",        campaignId: "camp-june", title: "Internship Strategy",                        url: "https://youtu.be/HgsoWFIaT18",                               platform: "YouTube",   goLiveDate: "2026-06-19", format: "Integration", status: "Live" },
  { id: "v60", creatorId: "c60", creatorName: "WhyBhanshu",          campaignId: "camp-june", title: "FIFA World Cup cost breakdown",               url: "https://youtu.be/cjp0IXYbw6I",                               platform: "YouTube",   goLiveDate: "2026-06-20", format: "Integration", status: "Live" },
  { id: "v61", creatorId: "c61", creatorName: "Mohammed Fraz",       campaignId: "camp-june", title: "The End of LeetCode? How AI Changed FAANG Interviews in 2026", url: "https://youtu.be/9tlsHKAoPkY", platform: "YouTube", goLiveDate: "2026-06-21", format: "Integration", status: "Live" },
  { id: "v62", creatorId: "c62", creatorName: "Think Wings",         campaignId: "camp-june", title: "Think Wings",           url: "https://www.youtube.com/@thinkwings",                         platform: "YouTube",   goLiveDate: "2026-06-27", format: "Integration", status: "Scheduled" },
  { id: "v63", creatorId: "c63", creatorName: "Full Disclosure",     campaignId: "camp-june", title: "Full Disclosure",       url: "https://www.youtube.com/@fulldisclosureyt",                   platform: "YouTube",   goLiveDate: "2026-06-30", format: "Integration", status: "Scheduled" },
  { id: "v64", creatorId: "c64", creatorName: "Technical Suneja",    campaignId: "camp-june", title: "Technical Suneja",      url: "https://www.youtube.com/@technicalsuneja",                    platform: "YouTube",   goLiveDate: "2026-07-03", format: "Integration", status: "Scheduled" },
  { id: "v65", creatorId: "c65", creatorName: "Dhaval Kataria",      campaignId: "camp-june", title: "Dhaval Kataria",        url: "https://www.youtube.com/@dhavalkataria",                      platform: "YouTube",   goLiveDate: "2026-07-07", format: "Integration", status: "Scheduled" },
  { id: "v66", creatorId: "c66", creatorName: "Tharun Speaks",       campaignId: "camp-june", title: "Tharun Speaks",         url: "https://www.youtube.com/@tharunspeaks",                       platform: "YouTube",   goLiveDate: "2026-07-10", format: "Integration", status: "Scheduled" },
  // ── Coding First — June 2026 (YouTube) ─────────────────────
  { id: "v67", creatorId: "c67", creatorName: "Coding with Sagar",  campaignId: "camp-june", title: "FastAPI for Machine Learning - Full Course",                          url: "https://www.youtube.com/watch?v=2tagcO5v9aw",   platform: "YouTube", goLiveDate: "2026-06-05", format: "Integration", status: "Live" },
  { id: "v68", creatorId: "c68", creatorName: "Nishant Chahar",     campaignId: "camp-june", title: "SKILLS That Will Get You High-Paying Jobs in 2026",                   url: "https://youtu.be/78z_gw5rh6s",                  platform: "YouTube", goLiveDate: "2026-06-08", format: "Integration", status: "Live" },
  { id: "v69", creatorId: "c69", creatorName: "Saumya Singh",       campaignId: "camp-june", title: "I Reviewed 1000+ Resumes. These Projects Get You Hired in 2026",     url: "https://youtu.be/mJOUQ700KaY",                  platform: "YouTube", goLiveDate: "2026-06-03", format: "Integration", status: "Live" },
  { id: "v70", creatorId: "c70", creatorName: "Pavan Lalwani",      campaignId: "camp-june", title: "I Used Power BI MCP and It Replaced Hours of Manual Work (2026)",    url: "https://www.youtube.com/watch?v=OrJpkD7XHt0",   platform: "YouTube", goLiveDate: "2026-06-17", format: "Integration", status: "Live" },
  { id: "v71", creatorId: "c71", creatorName: "Mehul Mohan",        campaignId: "camp-june", title: "You Can Finally Stop Using Bun",                                     url: "https://youtu.be/y--xkGbsmZc",                  platform: "YouTube", goLiveDate: "2026-06-12", format: "Integration", status: "Live" },
  { id: "v72", creatorId: "c72", creatorName: "Sheryians Coding",   campaignId: "camp-june", title: "Sheryians Coding",    url: "https://www.youtube.com/@sheryians",             platform: "YouTube", goLiveDate: "2026-06-01", format: "Integration", status: "Live", missingInsightReason: "No confirmed video URL — view count from Google Sheet, unverified" },
  { id: "v73", creatorId: "c73", creatorName: "Engineering Digest", campaignId: "camp-june", title: "These 5 AI Tools Make Developers More Valuable Than Ever", url: "https://youtu.be/p09Nx8evpgk", platform: "YouTube", goLiveDate: "2026-06-24", format: "Integration", status: "Live" },
  { id: "v74", creatorId: "c74", creatorName: "Arsh Goyal",         campaignId: "camp-june", title: "Arsh Goyal",          url: "https://www.youtube.com/@arshgoyal",             platform: "YouTube", goLiveDate: "2026-06-23", format: "Integration", status: "Scheduled", missingInsightReason: "No confirmed video URL — scheduled or not yet confirmed live" },
  { id: "v75", creatorId: "c75", creatorName: "Code And Bug",       campaignId: "camp-june", title: "Code And Bug",        url: "https://www.youtube.com/@codeandbug",            platform: "YouTube", goLiveDate: "2026-06-20", format: "Integration", status: "Live", missingInsightReason: "No confirmed video URL — view count from Google Sheet, unverified" },
  { id: "v76", creatorId: "c76", creatorName: "Astro",              campaignId: "camp-june", title: "This FREE AI Coding Tool From Google Is Seriously Underrated!", url: "https://youtu.be/TRSfMlEnLJc", platform: "YouTube", goLiveDate: "2026-06-10", format: "Integration", status: "Live" },
];

// Performance data sourced from IG Insights screenshots + Google Sheet
// Saves included (Instagram-native metric). clickThroughs = 0 until Dub links configured.
// Maitri Mangal (v10) — insights shared as MP4; awaiting numeric extraction.
export const performances: VideoPerformance[] = [
  // Finnet Instagram (Sheet columns: Likes, Comments, Shares, Views, Saves)
  { videoId: "v1", views: 144082,  likes: 2200,  comments: 129,   shares: 671,   saves: 748,   watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-20" },
  { videoId: "v2", views: 1590533, likes: 52000, comments: 30000, shares: 33000, saves: 47000, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-20" },
  { videoId: "v3", views: 14546,   likes: 227,   comments: 29,    shares: 38,    saves: 29,    watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-20" },
  { videoId: "v4", views: 6500,    likes: 166,   comments: 27,    shares: 43,    saves: 53,    watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-20" },
  { videoId: "v5", views: 79999,   likes: 1374,  comments: 175,   shares: 307,   saves: 508,   watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-20" },
  { videoId: "v6", views: 26000,   likes: 334,   comments: 28,    shares: 18,    saves: 61,    watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-20" },
  // Finnet YouTube (Sheet: Likes, Comments, Impressions, Views — no saves)
  { videoId: "v7", views: 71075, likes: 427, comments: 38, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 1776900, recordedAt: "2026-06-25" },
  // AOS Aevy TV — 8 JPEG Drive screenshots (12–18 Mar 2026 session)
  {
    videoId: "v8", views: 80156, likes: 4146, comments: 153, shares: 1115, saves: 1096, reposts: 64,
    watchTimeMinutes: 16562, avgWatchTimeSec: 17, skipRate: 54.9,
    accountsReached: 49799, profileFollows: 92,
    clickThroughs: 0, recordedAt: "2026-03-18",
  },
  // AOS Arjun Vaidya — arjun_insight.jpg (Drive, 17–18 Mar 2026)
  {
    videoId: "v9", views: 27684, likes: 557, comments: 22, shares: 279, saves: 154, reposts: 7,
    watchTimeMinutes: 4228, profileFollows: 18,
    clickThroughs: 0, recordedAt: "2026-03-18",
  },
  // AOS Maitri Mangal — insights shared as video; data pending
  { videoId: "v10", views: 33563, likes: 700, comments: 0, shares: 85, saves: 237, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-03-18" },
  // Batch 1 — Palak / Direct / Social Tag — impressions pending from agency
  { videoId: "v77", views: 180000, likes: 2912, comments: 112, shares: 6623, saves: 2279, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-27" }, // Aarti Samant — Mastered Data
  { videoId: "v78", views: 53448, likes: 1326, comments: 225, shares: 320, saves: 421, watchTimeMinutes: 0, clickThroughs: 0, impressions: 64411, recordedAt: "2026-06-27" }, // Gayatri Agrawal — Mastered Data
  { videoId: "v79", views: 418204, likes: 10354, comments: 643, shares: 2258, saves: 3637, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-27" }, // Anurag Bansal — combined 2 IG posts from Mastered Data
  { videoId: "v80", views: 38676, likes: 896, comments: 34, shares: 571, saves: 500, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-27" }, // Ayush Wadhwa — Mastered Data
  { videoId: "v81", views: 0, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" }, // Jivraj Sachar
  { videoId: "v82", views: 0, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" }, // Miti Shah
  { videoId: "v83", views: 109768, likes: 472, comments: 88, shares: 135, saves: 218, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-27" }, // Ansh Mehra — Mastered Data
  { videoId: "v84", views: 35912, likes: 762, comments: 161, shares: 381, saves: 522, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-27" }, // Paras Madan — Mastered Data
  { videoId: "v85", views: 32000, likes: 1100, comments: 41, shares: 83, saves: 187, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-27" }, // Anik Jain — Mastered Data
  { videoId: "v86", views: 0, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" }, // Aditya Agrawal
  { videoId: "v93", views: 0, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-27" }, // Anurag Bansal — IG Reel 2: views aggregated into v79 combined total (418,204)
  { videoId: "v92", views: 19322, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 483000, recordedAt: "2026-06-25" }, // CA Nandini — This AI Tool is Better Than Claude?
  { videoId: "v87", views: 150832, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 2200000, reportedImpressions: 2200000, impressionSource: "platform" as const, recordedAt: "2026-06-25" }, // Ishan Sharma — 10 Claude Skills (YT Studio: 2.2M imp, 5.0% CTR)
  { videoId: "v88", views: 18743,  likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 302900,  reportedImpressions: 302900,  impressionSource: "platform" as const, recordedAt: "2026-06-25" }, // Ishan Sharma — Wispr Flow Tutorial (YT Studio: 302.9K imp, 4.4% CTR)
  { videoId: "v94", views: 128400, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 2100000, reportedImpressions: 2100000, impressionSource: "platform" as const, recordedAt: "2026-06-25" }, // Ishan Sharma — Full Claude Tutorial (YT Studio: 2.1M imp, 4.5% CTR)
  { videoId: "v91", views: 139918, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 1700000, reportedImpressions: 1700000, impressionSource: "platform" as const, recordedAt: "2026-06-25" }, // Vaibhav Sisinity — Claude Fable 5 (YT Studio: 1.7M imp, 5.9% CTR)
  { videoId: "v89", views: 65154,  likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 1629000, recordedAt: "2026-06-25" }, // Anurag Bansal — IPL Money-Making
  { videoId: "v90", views: 25389,  likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 634700,  recordedAt: "2026-06-25" }, // Anurag Bansal — Amazon Delivery
  // Owled — full metrics from Sheet 4 (1b13aZcqM5q82Hm9KQLKxDVwdVWxdguiBxxgJLrpYzp8), synced 22 Jun 2026
  { videoId: "v11", views: 0,       likes: 0,     comments: 0,   shares: 0,    saves: 0,    reposts: 0,   watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" }, // gommaboy — page deleted
  { videoId: "v12", views: 4640,    likes: 148,   comments: 6,   shares: 24,   saves: 6,    reposts: 4,   watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" },
  { videoId: "v13", views: 55144,   likes: 658,   comments: 14,  shares: 92,   saves: 69,   reposts: 10,  watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" },
  { videoId: "v14", views: 118893,  likes: 5093,  comments: 34,  shares: 71,   saves: 151,  reposts: 32,  watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" },
  { videoId: "v15", views: 219195,  likes: 4319,  comments: 185, shares: 496,  saves: 297,  reposts: 14,  watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" },
  { videoId: "v16", views: 43987,   likes: 700,   comments: 7,   shares: 5,    saves: 3,    reposts: 2,   watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" }, // carousel
  { videoId: "v17", views: 48011,   likes: 1665,  comments: 17,  shares: 229,  saves: 60,   reposts: 13,  watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" },
  { videoId: "v18", views: 171401,  likes: 1363,  comments: 14,  shares: 136,  saves: 120,  reposts: 3,   watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" },
  { videoId: "v19", views: 1271174, likes: 22762, comments: 69,  shares: 6133, saves: 7459, reposts: 284, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" },
  { videoId: "v20", views: 162755,  likes: 8143,  comments: 31,  shares: 1083, saves: 796,  reposts: 52,  watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-06-22" },
  // LinkedIn Seeding — impressions→views, accountsReached from sheet
  { videoId: "v21", views: 13777,  likes: 276, comments: 30, shares: 0, reposts: 1, watchTimeMinutes: 0, clickThroughs: 0, impressions: 13777,  accountsReached: 9972,   recordedAt: "2026-06-20" },
  { videoId: "v22", views: 57003,  likes: 325, comments: 98, shares: 0, reposts: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 57003,  accountsReached: 41902,  recordedAt: "2026-06-20" },
  { videoId: "v23", views: 166064, likes: 472, comments: 14, shares: 0, reposts: 6, watchTimeMinutes: 0, clickThroughs: 0, impressions: 166064, accountsReached: 123007, recordedAt: "2026-06-20" },
  { videoId: "v24", views: 88624,  likes: 410, comments: 84, shares: 0, reposts: 1, watchTimeMinutes: 0, clickThroughs: 0, impressions: 88624,  accountsReached: 73822,  recordedAt: "2026-06-20" },
  { videoId: "v25", views: 5286,   likes: 49,  comments: 13, shares: 0, reposts: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 5286,   accountsReached: 3922,   recordedAt: "2026-06-20" },
  { videoId: "v26", views: 12345,  likes: 113, comments: 8,  shares: 0, reposts: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 12345,  accountsReached: 7894,   recordedAt: "2026-06-20" },
  { videoId: "v27", views: 44822,  likes: 550, comments: 16, shares: 0, reposts: 1, watchTimeMinutes: 0, clickThroughs: 0, impressions: 44822,  accountsReached: 34567,  recordedAt: "2026-06-20" },
  { videoId: "v28", views: 3166,   likes: 38,  comments: 3,  shares: 0, reposts: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 3166,   accountsReached: 2066,   recordedAt: "2026-06-20" },
  { videoId: "v29", views: 2825,   likes: 38,  comments: 5,  shares: 0, reposts: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 2825,   accountsReached: 1743,   recordedAt: "2026-06-20" },
  { videoId: "v30", views: 4325,   likes: 59,  comments: 2,  shares: 0, reposts: 1, watchTimeMinutes: 0, clickThroughs: 0, impressions: 4325,   accountsReached: 3456,   recordedAt: "2026-06-20" },
  { videoId: "v31", views: 6465,   likes: 289, comments: 71, shares: 0, reposts: 3, watchTimeMinutes: 0, clickThroughs: 0, impressions: 6465,   accountsReached: 4237,   recordedAt: "2026-06-20" },
  // LinkedIn MTW — full metrics from sheet
  { videoId: "v32", views: 22000,  likes: 282, comments: 14,  shares: 0, reposts: 0,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 22000,  accountsReached: 16000,  recordedAt: "2026-06-20" },
  { videoId: "v33", views: 16000,  likes: 310, comments: 1,   shares: 0, reposts: 0,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 16000,  accountsReached: 24000,  recordedAt: "2026-06-20" },
  { videoId: "v34", views: 32000,  likes: 178, comments: 16,  shares: 0, reposts: 1,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 32000,  accountsReached: 20000,  recordedAt: "2026-06-20" },
  { videoId: "v35", views: 3556,   likes: 171, comments: 45,  shares: 0, reposts: 32, watchTimeMinutes: 0, clickThroughs: 0, impressions: 3556,   accountsReached: 1922,   recordedAt: "2026-06-20" },
  { videoId: "v36", views: 8000,   likes: 196, comments: 46,  shares: 0, reposts: 0,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 8000,   accountsReached: 6000,   recordedAt: "2026-06-20" },
  { videoId: "v37", views: 2000,   likes: 158, comments: 98,  shares: 0, reposts: 1,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 2000,   accountsReached: 1100,   recordedAt: "2026-06-20" },
  { videoId: "v38", views: 31000,  likes: 354, comments: 85,  shares: 0, reposts: 0,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 31000,  accountsReached: 19000,  recordedAt: "2026-06-20" },
  { videoId: "v39", views: 1000,   likes: 103, comments: 29,  shares: 0, reposts: 2,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 1000,   accountsReached: 700,    recordedAt: "2026-06-20" },
  { videoId: "v40", views: 978,    likes: 35,  comments: 4,   shares: 0, reposts: 0,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 978,    accountsReached: 642,    recordedAt: "2026-06-20" },
  { videoId: "v41", views: 171895, likes: 160, comments: 21,  shares: 0, reposts: 2,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 171895, accountsReached: 116553, recordedAt: "2026-06-20" },
  { videoId: "v42", views: 60000,  likes: 335, comments: 32,  shares: 0, reposts: 5,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 60000,  accountsReached: 40000,  recordedAt: "2026-06-20" },
  { videoId: "v43", views: 550,    likes: 150, comments: 17,  shares: 0, reposts: 2,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 550,    accountsReached: 300,    recordedAt: "2026-06-20" },
  { videoId: "v44", views: 9000,   likes: 134, comments: 65,  shares: 0, reposts: 0,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 9000,   accountsReached: 5500,   recordedAt: "2026-06-20" },
  { videoId: "v45", views: 65000,  likes: 336, comments: 85,  shares: 0, reposts: 2,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 65000,  accountsReached: 45000,  recordedAt: "2026-06-20" },
  { videoId: "v46", views: 1771,   likes: 156, comments: 10,  shares: 0, reposts: 0,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 1771,   accountsReached: 1105,   recordedAt: "2026-06-20" },
  { videoId: "v47", views: 25000,  likes: 104, comments: 6,   shares: 0, reposts: 0,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 25000,  accountsReached: 18000,  recordedAt: "2026-06-20" },
  { videoId: "v48", views: 143000, likes: 393, comments: 25,  shares: 0, reposts: 0,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 143000, accountsReached: 109000, recordedAt: "2026-06-20" },
  { videoId: "v49", views: 55000,  likes: 632, comments: 95,  shares: 0, reposts: 1,  watchTimeMinutes: 0, clickThroughs: 0, impressions: 55000,  accountsReached: 33200,  recordedAt: "2026-06-20" },
  // Wispr × WLDD June 2026 — UTM clicks → clickThroughs; views/likes from sheet where available
  // Instagram (IG views from sheet; saves not available from UTM dashboard)
  { videoId: "v50", views: 15039,  likes: 88,   comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 78,   recordedAt: "2026-06-22" },
  { videoId: "v51", views: 4139,   likes: 3,    comments: 39,  shares: 0, watchTimeMinutes: 0, clickThroughs: 36,   recordedAt: "2026-06-22" },
  { videoId: "v52", views: 20168,  likes: 471,  comments: 109, shares: 0, watchTimeMinutes: 0, clickThroughs: 72,   recordedAt: "2026-06-22" },
  { videoId: "v53", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 685,  recordedAt: "2026-06-22" }, // views not in tracker
  { videoId: "v54", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 65,   recordedAt: "2026-06-22" }, // views not in tracker
  // YouTube
  { videoId: "v55", views: 11354,  likes: 489,  comments: 139, shares: 0, watchTimeMinutes: 0, clickThroughs: 168,  recordedAt: "2026-06-25" },
  { videoId: "v56", views: 157488, likes: 7962, comments: 406, shares: 0, watchTimeMinutes: 0, clickThroughs: 1740, recordedAt: "2026-06-25" },
  { videoId: "v57", views: 153343, likes: 4636, comments: 209, shares: 0, watchTimeMinutes: 0, clickThroughs: 438,  recordedAt: "2026-06-25" },
  { videoId: "v58", views: 50170,  likes: 889,  comments: 70,  shares: 0, watchTimeMinutes: 0, clickThroughs: 51,   recordedAt: "2026-06-25" },
  { videoId: "v59", views: 23829,  likes: 1279, comments: 250, shares: 0, watchTimeMinutes: 0, clickThroughs: 96,   recordedAt: "2026-06-25" },
  { videoId: "v60", views: 6557,   likes: 275,  comments: 45,  shares: 0, watchTimeMinutes: 0, clickThroughs: 65,   recordedAt: "2026-06-25" },
  { videoId: "v61", views: 28411,  likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 1,    recordedAt: "2026-06-25" }, // Mohammed Fraz
  { videoId: "v62", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 1,    recordedAt: "2026-06-22" }, // not yet live
  { videoId: "v63", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 0,    recordedAt: "2026-06-22" },
  { videoId: "v64", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 1,    recordedAt: "2026-06-22" },
  { videoId: "v65", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 0,    recordedAt: "2026-06-22" },
  { videoId: "v66", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 0,    recordedAt: "2026-06-22" },
  // Coding First — June 2026 — views scraped Jun 25; clickThroughs from Dub
  { videoId: "v67", views: 29228, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 179, recordedAt: "2026-06-25" },
  { videoId: "v68", views: 14912, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 219, recordedAt: "2026-06-25" },
  { videoId: "v69", views: 5499,  likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 46,  recordedAt: "2026-06-25" },
  { videoId: "v70", views: 22029, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 41,  recordedAt: "2026-06-25" },
  { videoId: "v71", views: 16219, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 60,  recordedAt: "2026-06-25" },
  { videoId: "v72", views: 25000, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0,   recordedAt: "2026-06-22" }, // no UTM data — channel URL, no scraped view count
  { videoId: "v73", views: 2184,  likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 1,   recordedAt: "2026-06-25" },
  { videoId: "v74", views: 2500,  likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 1,   recordedAt: "2026-06-22" },
  { videoId: "v75", views: 12000, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 1,   recordedAt: "2026-06-22" }, // codeandbug — channel URL, no scraped view count
  { videoId: "v76", views: 2879,  likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 25,  recordedAt: "2026-06-25" }, // astrokj Dub slug
];

// MTW referral signups — tracked via wisprflow.ai/r/* short links in LinkedIn posts
// attributionSource: "Manual" (short link click → signup, not Dub API)
// Total confirmed MTW signups: 200
export const installs: InstallRecord[] = [
  { id: "i1",  videoId: "v32", creatorId: "c32", campaignId: "camp-mtw", installs: 1,   attributionSource: "Manual", date: "2026-05-17", revenue: 0 },
  { id: "i2",  videoId: "v33", creatorId: "c33", campaignId: "camp-mtw", installs: 7,   attributionSource: "Manual", date: "2026-05-17", revenue: 0 },
  { id: "i3",  videoId: "v36", creatorId: "c36", campaignId: "camp-mtw", installs: 13,  attributionSource: "Manual", date: "2026-05-16", revenue: 0 },
  { id: "i4",  videoId: "v38", creatorId: "c38", campaignId: "camp-mtw", installs: 16,  attributionSource: "Manual", date: "2026-05-17", revenue: 0 },
  { id: "i5",  videoId: "v41", creatorId: "c41", campaignId: "camp-mtw", installs: 132, attributionSource: "Manual", date: "2026-05-21", revenue: 0 },
  { id: "i6",  videoId: "v44", creatorId: "c44", campaignId: "camp-mtw", installs: 3,   attributionSource: "Manual", date: "2026-05-18", revenue: 0 },
  { id: "i7",  videoId: "v45", creatorId: "c45", campaignId: "camp-mtw", installs: 10,  attributionSource: "Manual", date: "2026-05-17", revenue: 0 },
  { id: "i8",  videoId: "v48", creatorId: "c48", campaignId: "camp-mtw", installs: 18,  attributionSource: "Manual", date: "2026-05-17", revenue: 0 },
  // Wispr × WLDD June 2026 — UTM signup counts from Dub dashboard (ref.wisprflow.ai/*)
  { id: "i9",  videoId: "v55", creatorId: "c55", campaignId: "camp-june", installs: 21,  attributionSource: "Dub", date: "2026-06-10", revenue: 35616 },
  { id: "i10", videoId: "v56", creatorId: "c56", campaignId: "camp-june", installs: 190, attributionSource: "Dub", date: "2026-06-10", revenue: 0 },
  { id: "i11", videoId: "v57", creatorId: "c57", campaignId: "camp-june", installs: 8,   attributionSource: "Dub", date: "2026-06-13", revenue: 0 },
  { id: "i12", videoId: "v59", creatorId: "c59", campaignId: "camp-june", installs: 2,   attributionSource: "Dub", date: "2026-06-19", revenue: 0 },
  { id: "i13", videoId: "v60", creatorId: "c60", campaignId: "camp-june", installs: 1,   attributionSource: "Dub", date: "2026-06-20", revenue: 0 },
  // Coding First — June 2026 — UTM signups from Dub
  { id: "i14", videoId: "v67", creatorId: "c67", campaignId: "camp-june", installs: 6,   attributionSource: "Dub", date: "2026-06-05", revenue: 0 },
  { id: "i15", videoId: "v68", creatorId: "c68", campaignId: "camp-june", installs: 7,   attributionSource: "Dub", date: "2026-06-08", revenue: 0 },
  { id: "i16", videoId: "v69", creatorId: "c69", campaignId: "camp-june", installs: 3,   attributionSource: "Dub", date: "2026-06-03", revenue: 0 },
  { id: "i17", videoId: "v70", creatorId: "c70", campaignId: "camp-june", installs: 2,   attributionSource: "Dub", date: "2026-06-17", revenue: 0 },
  { id: "i18", videoId: "v71", creatorId: "c71", campaignId: "camp-june", installs: 2,   attributionSource: "Dub", date: "2026-06-12", revenue: 0 },
];

export const costs: Cost[] = [
  // Finnet — "Commercials" column from sheet (INR, gross = net — agency fee not itemised)
  { videoId: "v1",  creatorId: "c1",  campaignId: "camp-india", grossCost: 400000, agencyFee: 0, netCost: 400000, currency: "INR" },
  { videoId: "v2",  creatorId: "c2",  campaignId: "camp-india", grossCost: 300000, agencyFee: 0, netCost: 300000, currency: "INR" },
  { videoId: "v3",  creatorId: "c3",  campaignId: "camp-india", grossCost: 200000, agencyFee: 0, netCost: 200000, currency: "INR" },
  { videoId: "v4",  creatorId: "c4",  campaignId: "camp-india", grossCost: 12000,  agencyFee: 0, netCost: 12000,  currency: "INR" },
  { videoId: "v5",  creatorId: "c5",  campaignId: "camp-india", grossCost: 275000, agencyFee: 0, netCost: 275000, currency: "INR" },
  { videoId: "v6",  creatorId: "c6",  campaignId: "camp-india", grossCost: 160000, agencyFee: 0, netCost: 160000, currency: "INR" },
  { videoId: "v7",  creatorId: "c7",  campaignId: "camp-india", grossCost: 126000, agencyFee: 0, netCost: 126000, currency: "INR" }, // CA Nandini — from Finnet sheet
  // AOS — USD costs × ₹84
  { videoId: "v8",  creatorId: "c8",  campaignId: "camp-india", grossCost: 400000, agencyFee: 0, netCost: 400000, currency: "INR" }, // ₹4L from Batch 1 sheet
  { videoId: "v9",  creatorId: "c9",  campaignId: "camp-india", grossCost: 180000, agencyFee: 0, netCost: 180000, currency: "INR" }, // ₹1.8L from Batch 1 sheet
  { videoId: "v10", creatorId: "c10", campaignId: "camp-india", grossCost: 450000, agencyFee: 0, netCost: 450000, currency: "INR" }, // ₹4.5L from Batch 1 sheet
  // Owled — "Commercials (INR)" column from sheet (exact figures as entered)
  { videoId: "v11", creatorId: "c11", campaignId: "camp-india", grossCost: 420000,  agencyFee: 0, netCost: 420000,  currency: "INR" },
  { videoId: "v12", creatorId: "c12", campaignId: "camp-india", grossCost: 150000,  agencyFee: 0, netCost: 150000,  currency: "INR" },
  { videoId: "v13", creatorId: "c13", campaignId: "camp-india", grossCost: 90086,   agencyFee: 0, netCost: 90086,   currency: "INR" },
  { videoId: "v14", creatorId: "c14", campaignId: "camp-india", grossCost: 140000,  agencyFee: 0, netCost: 140000,  currency: "INR" },
  { videoId: "v15", creatorId: "c15", campaignId: "camp-india", grossCost: 240000,  agencyFee: 0, netCost: 240000,  currency: "INR" },
  { videoId: "v16", creatorId: "c16", campaignId: "camp-india", grossCost: 132063,  agencyFee: 0, netCost: 132063,  currency: "INR" },
  { videoId: "v17", creatorId: "c17", campaignId: "camp-india", grossCost: 550000,  agencyFee: 0, netCost: 550000,  currency: "INR" },
  { videoId: "v18", creatorId: "c18", campaignId: "camp-india", grossCost: 363172,  agencyFee: 0, netCost: 363172,  currency: "INR" },
  { videoId: "v19", creatorId: "c19", campaignId: "camp-india", grossCost: 550000,  agencyFee: 0, netCost: 550000,  currency: "INR" },
  { videoId: "v20", creatorId: "c20", campaignId: "camp-india", grossCost: 550000,  agencyFee: 0, netCost: 550000,  currency: "INR" },
  // LinkedIn MTW — costs from sheet (INR)
  { videoId: "v32", creatorId: "c32", campaignId: "camp-mtw", grossCost: 22000,  agencyFee: 0, netCost: 22000,  currency: "INR" },
  { videoId: "v33", creatorId: "c33", campaignId: "camp-mtw", grossCost: 20000,  agencyFee: 0, netCost: 20000,  currency: "INR" },
  { videoId: "v34", creatorId: "c34", campaignId: "camp-mtw", grossCost: 30000,  agencyFee: 0, netCost: 30000,  currency: "INR" },
  { videoId: "v35", creatorId: "c35", campaignId: "camp-mtw", grossCost: 30000,  agencyFee: 0, netCost: 30000,  currency: "INR" },
  { videoId: "v36", creatorId: "c36", campaignId: "camp-mtw", grossCost: 17000,  agencyFee: 0, netCost: 17000,  currency: "INR" },
  { videoId: "v37", creatorId: "c37", campaignId: "camp-mtw", grossCost: 20000,  agencyFee: 0, netCost: 20000,  currency: "INR" },
  { videoId: "v38", creatorId: "c38", campaignId: "camp-mtw", grossCost: 40000,  agencyFee: 0, netCost: 40000,  currency: "INR" },
  { videoId: "v39", creatorId: "c39", campaignId: "camp-mtw", grossCost: 26000,  agencyFee: 0, netCost: 26000,  currency: "INR" },
  { videoId: "v40", creatorId: "c40", campaignId: "camp-mtw", grossCost: 30000,  agencyFee: 0, netCost: 30000,  currency: "INR" },
  { videoId: "v41", creatorId: "c41", campaignId: "camp-mtw", grossCost: 40000,  agencyFee: 0, netCost: 40000,  currency: "INR" },
  { videoId: "v42", creatorId: "c42", campaignId: "camp-mtw", grossCost: 16000,  agencyFee: 0, netCost: 16000,  currency: "INR" },
  { videoId: "v43", creatorId: "c43", campaignId: "camp-mtw", grossCost: 16000,  agencyFee: 0, netCost: 16000,  currency: "INR" },
  { videoId: "v44", creatorId: "c44", campaignId: "camp-mtw", grossCost: 10000,  agencyFee: 0, netCost: 10000,  currency: "INR" },
  { videoId: "v45", creatorId: "c45", campaignId: "camp-mtw", grossCost: 20000,  agencyFee: 0, netCost: 20000,  currency: "INR" },
  { videoId: "v46", creatorId: "c46", campaignId: "camp-mtw", grossCost: 20000,  agencyFee: 0, netCost: 20000,  currency: "INR" },
  { videoId: "v47", creatorId: "c47", campaignId: "camp-mtw", grossCost: 40000,  agencyFee: 0, netCost: 40000,  currency: "INR" },
  { videoId: "v48", creatorId: "c48", campaignId: "camp-mtw", grossCost: 70000,  agencyFee: 0, netCost: 70000,  currency: "INR" },
  { videoId: "v49", creatorId: "c49", campaignId: "camp-mtw", grossCost: 55000,  agencyFee: 0, netCost: 55000,  currency: "INR" },
  // Batch 1 — Palak / Direct / Social Tag — fees from Batch 1 tab, claude tool - influencer sheet
  { videoId: "v77", creatorId: "c77", campaignId: "camp-india", grossCost: 220000, agencyFee: 0, netCost: 220000, currency: "INR" }, // Aarti Samant
  { videoId: "v78", creatorId: "c78", campaignId: "camp-india", grossCost: 500000, agencyFee: 0, netCost: 500000, currency: "INR" }, // Gayatri Agrawal
  { videoId: "v79", creatorId: "c79", campaignId: "camp-india", grossCost: 250000, agencyFee: 0, netCost: 250000, currency: "INR" }, // Anurag Bansal — IG Reel 1
  { videoId: "v93", creatorId: "c79", campaignId: "camp-india", grossCost: 100000, agencyFee: 0, netCost: 100000, currency: "INR" }, // Anurag Bansal — IG Reel 2
  { videoId: "v80", creatorId: "c80", campaignId: "camp-india", grossCost: 600000, agencyFee: 0, netCost: 600000, currency: "INR" }, // Ayush Wadhwa
  { videoId: "v81", creatorId: "c81", campaignId: "camp-india", grossCost: 40000,  agencyFee: 0, netCost: 40000,  currency: "INR" }, // Jivraj Sachar
  { videoId: "v82", creatorId: "c82", campaignId: "camp-india", grossCost: 0,      agencyFee: 0, netCost: 0,      currency: "INR" }, // Miti Shah — ₹0 fee
  { videoId: "v83", creatorId: "c83", campaignId: "camp-india", grossCost: 300000, agencyFee: 0, netCost: 300000, currency: "INR" }, // Ansh Mehra
  { videoId: "v84", creatorId: "c84", campaignId: "camp-india", grossCost: 65000,  agencyFee: 0, netCost: 65000,  currency: "INR" }, // Paras Madan
  { videoId: "v85", creatorId: "c85", campaignId: "camp-india", grossCost: 300000, agencyFee: 0, netCost: 300000, currency: "INR" }, // Anik Jain
  { videoId: "v86", creatorId: "c86", campaignId: "camp-india", grossCost: 35000,  agencyFee: 0, netCost: 35000,  currency: "INR" }, // Aditya Agrawal
  // LinkedIn Seeding — no cost data in sheet (organic seeding)
  // Wispr × WLDD June 2026 — ₹30,60,000 actual total (confirmed from WLDD master sheet 2026-06-27)
  // costConfidence: "actual" — exact per-creator costs from agency sheet
  { videoId: "v50", creatorId: "c50", campaignId: "camp-june", grossCost:  20000, agencyFee: 0, netCost:  20000, currency: "INR", costConfidence: "actual" as const }, // infoby_shree
  { videoId: "v51", creatorId: "c51", campaignId: "camp-june", grossCost:  25000, agencyFee: 0, netCost:  25000, currency: "INR", costConfidence: "actual" as const }, // insta__nirav
  { videoId: "v52", creatorId: "c52", campaignId: "camp-june", grossCost:  30000, agencyFee: 0, netCost:  30000, currency: "INR", costConfidence: "actual" as const }, // kochu.ai
  { videoId: "v53", creatorId: "c53", campaignId: "camp-june", grossCost:  70000, agencyFee: 0, netCost:  70000, currency: "INR", costConfidence: "actual" as const }, // financewithjobi
  { videoId: "v54", creatorId: "c54", campaignId: "camp-june", grossCost: 100000, agencyFee: 0, netCost: 100000, currency: "INR", costConfidence: "actual" as const }, // prettymuchbusiness
  { videoId: "v55", creatorId: "c55", campaignId: "camp-june", grossCost:  75000, agencyFee: 0, netCost:  75000, currency: "INR", costConfidence: "actual" as const }, // Apple Wale Bhaiya
  { videoId: "v56", creatorId: "c56", campaignId: "camp-june", grossCost: 400000, agencyFee: 0, netCost: 400000, currency: "INR", costConfidence: "actual" as const }, // ezsnippet
  { videoId: "v57", creatorId: "c57", campaignId: "camp-june", grossCost: 220000, agencyFee: 0, netCost: 220000, currency: "INR", costConfidence: "actual" as const }, // Vaibhav Kadnar
  { videoId: "v58", creatorId: "c58", campaignId: "camp-june", grossCost: 200000, agencyFee: 0, netCost: 200000, currency: "INR", costConfidence: "actual" as const }, // bisboworld
  { videoId: "v59", creatorId: "c59", campaignId: "camp-june", grossCost: 100000, agencyFee: 0, netCost: 100000, currency: "INR", costConfidence: "actual" as const }, // Akber Shaikh
  { videoId: "v60", creatorId: "c60", campaignId: "camp-june", grossCost: 180000, agencyFee: 0, netCost: 180000, currency: "INR", costConfidence: "actual" as const }, // WhyBhanshu
  { videoId: "v61", creatorId: "c61", campaignId: "camp-june", grossCost: 200000, agencyFee: 0, netCost: 200000, currency: "INR", costConfidence: "actual" as const }, // Mohammed Fraz
  { videoId: "v62", creatorId: "c62", campaignId: "camp-june", grossCost: 180000, agencyFee: 0, netCost: 180000, currency: "INR", costConfidence: "actual" as const }, // Think Wings
  { videoId: "v63", creatorId: "c63", campaignId: "camp-june", grossCost: 500000, agencyFee: 0, netCost: 500000, currency: "INR", costConfidence: "actual" as const }, // Full Disclosure
  { videoId: "v64", creatorId: "c64", campaignId: "camp-june", grossCost: 180000, agencyFee: 0, netCost: 180000, currency: "INR", costConfidence: "actual" as const }, // Technical Suneja
  { videoId: "v65", creatorId: "c65", campaignId: "camp-june", grossCost: 180000, agencyFee: 0, netCost: 180000, currency: "INR", costConfidence: "actual" as const }, // Dhaval Kataria
  { videoId: "v66", creatorId: "c66", campaignId: "camp-june", grossCost: 400000, agencyFee: 0, netCost: 400000, currency: "INR", costConfidence: "actual" as const }, // Tharun Speaks
  // Coding First — June 2026 — costs from "coding first - june" tab, Sheet 1
  // Column D = quoted, Column G = net negotiated. Source: gviz API, 22 Jun 2026
  { videoId: "v67", creatorId: "c67", campaignId: "camp-june", grossCost: 179000, agencyFee: 0, netCost: 150000, currency: "INR" }, // Coding with Sagar
  { videoId: "v68", creatorId: "c68", campaignId: "camp-june", grossCost: 286000, agencyFee: 0, netCost: 200000, currency: "INR" }, // Nishant Chahar
  { videoId: "v69", creatorId: "c69", campaignId: "camp-june", grossCost: 177000, agencyFee: 0, netCost: 150000, currency: "INR" }, // Saumya Singh
  { videoId: "v70", creatorId: "c70", campaignId: "camp-june", grossCost: 160000, agencyFee: 0, netCost: 140000, currency: "INR" }, // Pavan Lalwani
  { videoId: "v71", creatorId: "c71", campaignId: "camp-june", grossCost: 165000, agencyFee: 0, netCost: 165000, currency: "INR" }, // Mehul Mohan
  { videoId: "v72", creatorId: "c72", campaignId: "camp-june", grossCost: 100000, agencyFee: 0, netCost:  75000, currency: "INR" }, // Sheryians Coding
  { videoId: "v73", creatorId: "c73", campaignId: "camp-june", grossCost:  41000, agencyFee: 0, netCost:  41000, currency: "INR" }, // Engineering Digest
  { videoId: "v74", creatorId: "c74", campaignId: "camp-june", grossCost: 143000, agencyFee: 0, netCost: 143000, currency: "INR" }, // Arsh Goyal
  { videoId: "v75", creatorId: "c75", campaignId: "camp-june", grossCost:  56000, agencyFee: 0, netCost:  56000, currency: "INR" }, // Code And Bug
  { videoId: "v76", creatorId: "c76", campaignId: "camp-june", grossCost:  62000, agencyFee: 0, netCost:  62000, currency: "INR" }, // Astro
  { videoId: "v92", creatorId: "c7",  campaignId: "camp-june", grossCost: 126000, agencyFee: 0, netCost: 126000, currency: "INR" }, // CA Nandini — direct deal
  { videoId: "v87", creatorId: "c87", campaignId: "camp-june", grossCost: 273000, agencyFee: 0, netCost: 273000, currency: "INR" }, // Ishan — 10 Claude Skills ($3,250 USD)
  { videoId: "v88", creatorId: "c87", campaignId: "camp-june", grossCost: 273000, agencyFee: 0, netCost: 273000, currency: "INR" }, // Ishan — Wispr Flow Tutorial ($3,250 USD)
  { videoId: "v94", creatorId: "c87", campaignId: "camp-june", grossCost: 273000, agencyFee: 0, netCost: 273000, currency: "INR" }, // Ishan — Full Claude Tutorial ($3,250 USD)
  { videoId: "v91", creatorId: "c88", campaignId: "camp-june", grossCost: 840000, agencyFee: 0, netCost: 840000, currency: "INR" }, // Vaibhav Sisinity ($10K USD)
  { videoId: "v89", creatorId: "c79", campaignId: "camp-june", grossCost: 300000, agencyFee: 0, netCost: 300000, currency: "INR" }, // Anurag — IPL
  { videoId: "v90", creatorId: "c79", campaignId: "camp-june", grossCost: 300000, agencyFee: 0, netCost: 300000, currency: "INR" }, // Anurag — Amazon
];

// ── Derived metrics ──────────────────────────────────────────

export function getCreatorMetrics(
  creatorId: string,
  dubByVideo?: Record<string, { clicks: number; leads: number }>
): CreatorMetrics {
  const creatorVideos = videos.filter((v) => v.creatorId === creatorId);
  const videoIds = new Set(creatorVideos.map((v) => v.id));

  const creatorPerfs = performances.filter((p) => videoIds.has(p.videoId));
  const creatorInstalls = installs.filter((i) => i.creatorId === creatorId);
  const creatorCosts = costs.filter((c) => c.creatorId === creatorId);

  const totalViews = creatorPerfs.reduce((s, p) => s + (p.impressions ?? p.views), 0);
  const totalClicks = creatorPerfs.reduce(
    (s, p) => s + (dubByVideo?.[p.videoId]?.clicks ?? p.clickThroughs),
    0
  );
  // Use Dub leads per video when available, fall back to mock installs table
  const totalInstallsCount = creatorVideos.reduce((s, v) => {
    const dubLeads = dubByVideo?.[v.id]?.leads;
    if (dubLeads !== undefined) return s + dubLeads;
    return s + (installs.find((i) => i.videoId === v.id)?.installs ?? 0);
  }, 0);
  const totalRevenue = creatorInstalls.reduce((s, i) => s + (i.revenue ?? 0), 0);
  const totalSpend = creatorCosts.reduce((s, c) => s + c.netCost, 0);
  const totalEngagements = creatorPerfs.reduce(
    (s, p) => s + p.likes + p.comments + p.shares + (p.saves ?? 0),
    0
  );

  const cpi = totalInstallsCount > 0 && totalSpend > 0 ? totalSpend / totalInstallsCount : 0;
  const cpv = totalViews > 0 && totalSpend > 0 ? totalSpend / totalViews : 0;
  const cpc = totalClicks > 0 && totalSpend > 0 ? totalSpend / totalClicks : 0;
  const clickToInstallRate = totalClicks > 0 ? (totalInstallsCount / totalClicks) * 100 : 0;
  const viewToInstallRate = totalViews > 0 ? (totalInstallsCount / totalViews) * 100 : 0;
  const roas = totalSpend > 0 && totalRevenue > 0 ? totalRevenue / totalSpend : 0;
  const engagementRate = totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0;

  // Efficiency: CPV rank (40pt) + engagement (30pt) + saves rate (30pt)
  const allCpvs = costs.map((c) => {
    const p = performances.find((p) => p.videoId === c.videoId);
    const pViews = p ? (p.impressions ?? p.views) : 0;
    return p && pViews > 0 && c.netCost > 0 ? c.netCost / pViews : 0;
  }).filter(Boolean);
  const maxCpv = allCpvs.length ? Math.max(...allCpvs) : 1;
  const cpvScore = cpv > 0 ? (1 - cpv / maxCpv) * 40 : 20;
  const engScore = Math.min(engagementRate * 3, 30);
  const totalSaves = creatorPerfs.reduce((s, p) => s + (p.saves ?? 0), 0);
  const savesRate = totalViews > 0 ? (totalSaves / totalViews) * 100 : 0;
  const totalComments = creatorPerfs.reduce((s, p) => s + p.comments, 0);
  const commentRate = totalViews > 0 ? (totalComments / totalViews) * 100 : 0;
  const savesScore = totalSaves > 0
    ? Math.min(savesRate * 10, 30)
    : Math.min(commentRate * 5, 30);
  const efficiencyScore = Math.round(Math.min(100, cpvScore + engScore + savesScore));

  return {
    creatorId,
    totalViews,
    totalClicks,
    totalInstalls: totalInstallsCount,
    totalRevenue,
    totalSpend,
    cpi,
    cpv,
    cpc,
    clickToInstallRate,
    viewToInstallRate,
    roas,
    engagementRate,
    efficiencyScore,
    videoCount: creatorVideos.length,
  };
}

export function getAllCreatorMetrics(
  dubByVideo?: Record<string, { clicks: number; leads: number }>
): CreatorMetrics[] {
  return creators.map((c) => getCreatorMetrics(c.id, dubByVideo));
}

export function getCampaignStats(campaignId: string) {
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) return null;
  const videoIds = new Set(videos.filter((v) => v.campaignId === campaignId).map((v) => v.id));
  const spent = costs.filter((c) => c.campaignId === campaignId).reduce((s, c) => s + c.netCost, 0);
  const totalInstallsCount = installs.filter((i) => i.campaignId === campaignId).reduce((s, i) => s + i.installs, 0);
  const totalViews = performances.filter((p) => videoIds.has(p.videoId)).reduce((s, p) => s + (p.impressions ?? p.views), 0);
  const totalRevenue = installs.filter((i) => i.campaignId === campaignId).reduce((s, i) => s + (i.revenue ?? 0), 0);
  const cpi = totalInstallsCount > 0 && spent > 0 ? spent / totalInstallsCount : 0;
  return {
    budget: campaign.totalBudget,
    spent,
    remaining: campaign.totalBudget - spent,
    pacingPct: campaign.totalBudget > 0 ? (spent / campaign.totalBudget) * 100 : 0,
    installs: totalInstallsCount,
    views: totalViews,
    revenue: totalRevenue,
    cpi,
    roas: spent > 0 && totalRevenue > 0 ? totalRevenue / spent : 0,
  };
}
