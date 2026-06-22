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
    followers: 1000000, avgViews: 144082,
    sheetUrl: "https://www.instagram.com/anushkarathod98/",
  },
  {
    id: "c2", name: "Nidhi Kunwar", handle: "@nidhi_kunwarr",
    platform: "Instagram", tier: "Macro", niche: "Finance / Women in Money",
    agency: "Finnet", contactEmail: "", status: "Active",
    followers: 857000, avgViews: 1590533,
    sheetUrl: "https://www.instagram.com/nidhi_kunwarr/",
  },
  {
    id: "c3", name: "Ayush Shukla", handle: "@ayushshukl.a",
    platform: "Instagram", tier: "Mid", niche: "Finance / Productivity",
    agency: "Finnet", contactEmail: "", status: "Active",
    followers: 244000, avgViews: 14546,
    sheetUrl: "https://www.instagram.com/ayushshukl.a/",
  },
  {
    id: "c4", name: "Ananya Bagri", handle: "@ananyabagri",
    platform: "Instagram", tier: "Nano", niche: "Finance / Career",
    agency: "Finnet", contactEmail: "", status: "Active",
    followers: 9930, avgViews: 6500,
    sheetUrl: "https://www.instagram.com/ananyabagri",
  },
  {
    id: "c5", name: "Jayant (Markets with Jayant)", handle: "@marketswithjayant",
    platform: "Instagram", tier: "Mid", niche: "Stock Market / Finance",
    agency: "Finnet", contactEmail: "", status: "Active",
    followers: 275000, avgViews: 79999,
    sheetUrl: "https://www.instagram.com/marketswithjayant/",
  },
  {
    id: "c6", name: "Shankar Bhalla", handle: "@shankar_unravelled",
    platform: "Instagram", tier: "Macro", niche: "Finance / Economics",
    agency: "Finnet", contactEmail: "", status: "Active",
    followers: 540000, avgViews: 26000,
    sheetUrl: "https://www.instagram.com/shankar_unravelled/",
  },
  {
    id: "c7", name: "CA Nandini", handle: "@ca_nandini19",
    platform: "YouTube", tier: "Mid", niche: "Chartered Accountancy / Finance",
    agency: "Finnet", contactEmail: "", status: "Active",
    followers: 377000, avgViews: 10700,
    sheetUrl: "https://www.youtube.com/@ca_nandini19/featured",
  },
  // ── AOS ───────────────────────────────────────────────────────
  {
    id: "c8", name: "Aevy TV", handle: "@aevytvdaily",
    platform: "Instagram", tier: "Mid", niche: "News / Finance / Business",
    agency: "AEOS", contactEmail: "", status: "Active",
    followers: 0, avgViews: 80156,
    sheetUrl: "https://www.instagram.com/aevytvdaily/",
  },
  {
    id: "c9", name: "Arjun Vaidya", handle: "@abvaidya",
    platform: "Instagram", tier: "Mid", niche: "Business / Entrepreneurship",
    agency: "AEOS", contactEmail: "", status: "Active",
    followers: 0, avgViews: 33563,
    sheetUrl: "https://www.instagram.com/abvaidya/",
  },
  {
    id: "c10", name: "Maitri Mangal", handle: "@maitrimangal",
    platform: "Instagram", tier: "Mid", niche: "Finance / Lifestyle",
    agency: "AEOS", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.instagram.com/maitrimangal/",
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
    followers: 52000, avgViews: 3556,
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
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 485000, avgViews: 45000,
    sheetUrl: "https://www.youtube.com/watch?v=2tagcO5v9aw",
  },
  {
    id: "c68", name: "Nishant Chahar", handle: "@nishantchahar",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 579000, avgViews: 10000,
    sheetUrl: "https://youtu.be/78z_gw5rh6s",
  },
  {
    id: "c69", name: "Saumya Singh", handle: "@saumyasingh",
    platform: "YouTube", tier: "Mid", niche: "Coding / Dev",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 195000, avgViews: 90000,
    sheetUrl: "https://youtu.be/mJOUQ700KaY",
  },
  {
    id: "c70", name: "Pavan Lalwani", handle: "@pavanlalwani",
    platform: "YouTube", tier: "Mid", niche: "Coding / Dev",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 320000, avgViews: 23000,
    sheetUrl: "https://www.youtube.com/watch?v=OrJpkD7XHt0",
  },
  {
    id: "c71", name: "Mehul Mohan", handle: "@mehulmohan",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 469000, avgViews: 6000,
    sheetUrl: "https://youtu.be/y--xkGbsmZc",
  },
  {
    id: "c72", name: "Sheryians Coding", handle: "@sheryianscoding",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 703000, avgViews: 25000,
    sheetUrl: "https://www.youtube.com/@sheryians",
  },
  {
    id: "c73", name: "Engineering Digest", handle: "@engineeringdigest",
    platform: "YouTube", tier: "Mid", niche: "Coding / Engineering",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 248000, avgViews: 9000,
    sheetUrl: "https://www.youtube.com/@engineeringdigest",
  },
  {
    id: "c74", name: "Arsh Goyal", handle: "@arshgoyal",
    platform: "YouTube", tier: "Mid", niche: "Coding / Dev / DSA",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 280000, avgViews: 2500,
    sheetUrl: "https://www.youtube.com/@arshgoyal",
  },
  {
    id: "c75", name: "Code And Bug", handle: "@codeandbug",
    platform: "YouTube", tier: "Nano", niche: "Coding / Dev",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 31600, avgViews: 12000,
    sheetUrl: "https://www.youtube.com/@codeandbug",
  },
  {
    id: "c76", name: "Astro", handle: "@astro-yt",
    platform: "YouTube", tier: "Micro", niche: "Coding / Dev",
    agency: "Direct", contactEmail: "", status: "Active",
    followers: 79000, avgViews: 2500,
    sheetUrl: "https://youtu.be/TRSfMlEnLJc",
  },
  // ── Wispr × WLDD June 2026 — Instagram ─────────────────────
  {
    id: "c50", name: "infoby_shree", handle: "@infoby_shree",
    platform: "Instagram", tier: "Micro", niche: "Regional / Kannada",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 0, avgViews: 15039,
    sheetUrl: "https://www.instagram.com/infoby_shree/",
  },
  {
    id: "c51", name: "insta__nirav", handle: "@insta__nirav",
    platform: "Instagram", tier: "Micro", niche: "Regional / Gujarati",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 0, avgViews: 4139,
    sheetUrl: "https://www.instagram.com/insta__nirav/",
  },
  {
    id: "c52", name: "kochu.ai", handle: "@kochu.ai",
    platform: "Instagram", tier: "Micro", niche: "Regional / Malayalam",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 0, avgViews: 20168,
    sheetUrl: "https://www.instagram.com/kochu.ai/",
  },
  {
    id: "c53", name: "financewithjobi", handle: "@financewithjobi",
    platform: "Instagram", tier: "Micro", niche: "Regional / Finance / Kannada",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.instagram.com/financewithjobi/",
  },
  {
    id: "c54", name: "prettymuchbusiness", handle: "@prettymuchbusiness",
    platform: "Instagram", tier: "Mid", niche: "Regional / Business / Kannada",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.instagram.com/prettymuchbusiness/",
  },
  // ── Wispr × WLDD June 2026 — YouTube ───────────────────────
  {
    id: "c55", name: "Apple Wale Bhaiya", handle: "@applewale-bhaiya",
    platform: "YouTube", tier: "Micro", niche: "Mac / Gadgets / Hinglish",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 38200, avgViews: 10858,
    sheetUrl: "https://youtu.be/KtZwESJLohc",
  },
  {
    id: "c56", name: "ezsnippet", handle: "@ezsnippet",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev / Hinglish",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 810000, avgViews: 146817,
    sheetUrl: "https://www.youtube.com/@ezsnippet",
  },
  {
    id: "c57", name: "Vaibhav Kadnar", handle: "@vaibhavkadnar",
    platform: "YouTube", tier: "Macro", niche: "Business / Finance / Hindi",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 7000000, avgViews: 122900,
    sheetUrl: "https://youtu.be/szGD3CmhulY",
  },
  {
    id: "c58", name: "bisboworld", handle: "@bisboworld",
    platform: "YouTube", tier: "Macro", niche: "Business / Finance / English",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 871000, avgViews: 48473,
    sheetUrl: "https://www.youtube.com/@bisboworld",
  },
  {
    id: "c59", name: "Akber Shaikh", handle: "@akbershaikh",
    platform: "YouTube", tier: "Micro", niche: "Coding / Dev / Hinglish",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 96600, avgViews: 17367,
    sheetUrl: "https://youtu.be/HgsoWFIaT18",
  },
  {
    id: "c60", name: "WhyBhanshu", handle: "@WhyBhanshu",
    platform: "YouTube", tier: "Macro", niche: "Business / Finance / English",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 101000, avgViews: 4370,
    sheetUrl: "https://youtu.be/cjp0IXYbw6I",
  },
  {
    id: "c61", name: "Mohammed Fraz", handle: "@mohammedfraz",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev / Hinglish",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 563000, avgViews: 0,
    sheetUrl: "https://www.youtube.com/@mohammedfraz",
  },
  {
    id: "c62", name: "Think Wings", handle: "@thinkwings",
    platform: "YouTube", tier: "Mid", niche: "Business / Finance / Hindi",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.youtube.com/@thinkwings",
  },
  {
    id: "c63", name: "Full Disclosure", handle: "@fulldisclosureyt",
    platform: "YouTube", tier: "Mid", niche: "Business / Finance / English",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.youtube.com/@fulldisclosureyt",
  },
  {
    id: "c64", name: "Technical Suneja", handle: "@technicalsuneja",
    platform: "YouTube", tier: "Macro", niche: "Coding / Dev / Hinglish",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.youtube.com/@technicalsuneja",
  },
  {
    id: "c65", name: "Dhaval Kataria", handle: "@dhavalkataria",
    platform: "YouTube", tier: "Mid", niche: "AI / Business / Hinglish",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.youtube.com/@dhavalkataria",
  },
  {
    id: "c66", name: "Tharun Speaks", handle: "@tharunspeaks",
    platform: "YouTube", tier: "Macro", niche: "Business / Growth / Hinglish",
    agency: "Social Tag", contactEmail: "", status: "Active",
    followers: 0, avgViews: 0,
    sheetUrl: "https://www.youtube.com/@tharunspeaks",
  },
];

// Total Finnet spend:  ₹4L + 3L + 2L + 12K + 2.75L + 1.6L = ₹13,47,000
// Total AOS spend:     $4500 + $1920 + $5000 = $11,420 × ₹84 = ₹9,59,280
// Total Owled spend:   ₹4,20,000 + 1,50,000 + 90,086 + 1,40,000 + 2,40,000 + 1,32,063 + 5,50,000 + 3,63,172 + 5,50,000 + 5,50,000 = ₹31,85,321
export const campaigns: Campaign[] = [
  {
    id: "camp1",
    name: "Finnet Influencer Campaign",
    startDate: "2026-05-15",
    totalBudget: 1347000,
    totalSpend: 1347000,
    status: "Active",
    primaryPlatform: "Multi",
    creatorIds: ["c1", "c2", "c3", "c4", "c5", "c6", "c7"],
    goal: "Brand awareness + app installs across IG & YouTube",
  },
  {
    id: "camp2",
    name: "AOS March 2026",
    startDate: "2026-03-12",
    endDate: "2026-03-31",
    totalBudget: Math.round(11420 * USD_INR),
    totalSpend: Math.round(11420 * USD_INR),
    status: "Ended",
    primaryPlatform: "Multi",
    creatorIds: ["c8", "c9", "c10"],
    goal: "App installs + brand awareness — IG Reels + YT Shorts",
  },
  {
    id: "camp3",
    name: "Owled Launch Campaign",
    startDate: "2026-05-07",
    totalBudget: 3185321,
    totalSpend: 3185321,
    status: "Active",
    primaryPlatform: "Instagram",
    creatorIds: ["c11", "c12", "c13", "c14", "c15", "c16", "c17", "c18", "c19", "c20"],
    goal: "Wispr Flow India launch — brand awareness via IG Reels & Carousel",
  },
  {
    id: "camp4",
    name: "LinkedIn — India Launch Kannada Seeding",
    startDate: "2026-04-20",
    totalBudget: 0,
    totalSpend: 0,
    status: "Ended",
    primaryPlatform: "LinkedIn",
    creatorIds: ["c21","c22","c23","c24","c25","c26","c27","c28","c29","c30","c31"],
    goal: "Organic LinkedIn seeding for Wispr Flow India launch — Kannada-speaking audience",
  },
  {
    id: "camp5",
    name: "LinkedIn — Wispr at MTW",
    startDate: "2026-05-16",
    endDate: "2026-05-21",
    totalBudget: 522000,
    totalSpend: 522000,
    status: "Ended",
    primaryPlatform: "LinkedIn",
    creatorIds: ["c32","c33","c34","c35","c36","c37","c38","c39","c40","c41","c42","c43","c44","c45","c46","c47","c48","c49"],
    goal: "Mumbai Tech Week activation — LinkedIn creators posting live from the event with referral links",
  },
  {
    id: "camp7",
    name: "Coding First — June 2026",
    startDate: "2026-06-01",
    totalBudget: 1182000,
    totalSpend: 0,
    status: "Active",
    primaryPlatform: "YouTube",
    creatorIds: ["c67","c68","c69","c70","c71","c72","c73","c74","c75","c76"],
    goal: "App signups via YouTube integrations — coding/dev audience with UTM-tracked links",
  },
  {
    id: "camp6",
    name: "Wispr × WLDD — June 2026",
    startDate: "2026-06-07",
    totalBudget: 0,
    totalSpend: 0,
    status: "Active",
    primaryPlatform: "Multi",
    creatorIds: ["c50","c51","c52","c53","c54","c55","c56","c57","c58","c59","c60","c61","c62","c63","c64","c65","c66"],
    goal: "Brand awareness + app signups — IG Reels & YouTube integrations with UTM-tracked referral links",
  },
];

export const videos: Video[] = [
  // ── Finnet — Instagram ──────────────────────────────────────
  {
    id: "v1", creatorId: "c1", creatorName: "Anushka Rathod", campaignId: "camp1",
    title: "Wispr AI — Anushka Rathod IG Reel",
    url: "https://www.instagram.com/reel/DWoZrPsvVc2/",
    platform: "Instagram", goLiveDate: "2026-05-20", format: "Integration", status: "Live",
  },
  {
    id: "v2", creatorId: "c2", creatorName: "Nidhi Kunwar", campaignId: "camp1",
    title: "Wispr AI — Nidhi Kunwar IG Reel",
    url: "https://www.instagram.com/reel/DWgtCi1jL5o/",
    platform: "Instagram", goLiveDate: "2026-05-25", format: "Integration", status: "Live",
  },
  {
    id: "v3", creatorId: "c3", creatorName: "Ayush Shukla", campaignId: "camp1",
    title: "Wispr AI — Ayush Shukla IG Reel",
    url: "https://www.instagram.com/reel/DWglq3fCgjx/",
    platform: "Instagram", goLiveDate: "2026-05-25", format: "Integration", status: "Live",
  },
  {
    id: "v4", creatorId: "c4", creatorName: "Ananya Bagri", campaignId: "camp1",
    title: "Wispr AI — Ananya Bagri IG Post",
    url: "https://www.instagram.com/p/DWTz_KNzfU-/",
    platform: "Instagram", goLiveDate: "2026-05-15", format: "Integration", status: "Live",
  },
  {
    id: "v5", creatorId: "c5", creatorName: "Jayant (Markets with Jayant)", campaignId: "camp1",
    title: "Wispr AI — Markets with Jayant IG Post",
    url: "https://www.instagram.com/p/DWTRiUACMlS/",
    platform: "Instagram", goLiveDate: "2026-05-15", format: "Integration", status: "Live",
  },
  {
    id: "v6", creatorId: "c6", creatorName: "Shankar Bhalla", campaignId: "camp1",
    title: "Wispr AI — Shankar Bhalla IG Reel",
    url: "https://www.instagram.com/reel/DW1XOIsk5J-/",
    platform: "Instagram", goLiveDate: "2026-06-01", format: "Integration", status: "Live",
  },
  // ── Finnet — YouTube ────────────────────────────────────────
  {
    id: "v7", creatorId: "c7", creatorName: "CA Nandini", campaignId: "camp1",
    title: "Wispr AI — CA Nandini YouTube Integration",
    url: "https://www.youtube.com/watch?v=0mr6d9z8iio",
    platform: "YouTube", goLiveDate: "2026-05-20", format: "Integration", status: "Live",
  },
  // ── AOS — Instagram ─────────────────────────────────────────
  {
    id: "v8", creatorId: "c8", creatorName: "Aevy TV", campaignId: "camp2",
    title: "Wispr AI — Aevy TV IG Reel",
    url: "https://www.instagram.com/reel/DVyTPmuD-XA/",
    platform: "Instagram", goLiveDate: "2026-03-12", format: "Dedicated", status: "Live",
  },
  {
    id: "v9", creatorId: "c9", creatorName: "Arjun Vaidya", campaignId: "camp2",
    title: "Wispr AI — Arjun Vaidya IG Reel",
    url: "https://www.instagram.com/reel/DWB-g4OgiuS/",
    platform: "Instagram", goLiveDate: "2026-03-17", format: "Integration", status: "Live",
  },
  {
    id: "v10", creatorId: "c10", creatorName: "Maitri Mangal", campaignId: "camp2",
    title: "Wispr AI — Maitri Mangal IG Reel",
    url: "https://www.instagram.com/reel/DWApCVZjUuj/",
    platform: "Instagram", goLiveDate: "2026-03-17", format: "Integration", status: "Live",
  },
  // ── Owled — Instagram ───────────────────────────────────────
  {
    id: "v11", creatorId: "c11", creatorName: "gommaboy", campaignId: "camp3",
    title: "Wispr Flow — gommaboy IG Reel",
    url: "https://www.instagram.com/reel/DXok0rJD2GF/",
    platform: "Instagram", goLiveDate: "2026-05-07", format: "Integration", status: "Live",
  },
  {
    id: "v12", creatorId: "c12", creatorName: "Kartik Sadvij", campaignId: "camp3",
    title: "Wispr Flow — Kartik Sadvij IG Reel",
    url: "https://www.instagram.com/reel/DX9ksZdsCJy/",
    platform: "Instagram", goLiveDate: "2026-05-14", format: "Integration", status: "Live",
  },
  {
    id: "v13", creatorId: "c13", creatorName: "Raj Patel", campaignId: "camp3",
    title: "Wispr Flow — Raj Patel IG Reel",
    url: "https://www.instagram.com/reel/DX4A7wqJTj5/",
    platform: "Instagram", goLiveDate: "2026-05-11", format: "Integration", status: "Live",
  },
  {
    id: "v14", creatorId: "c14", creatorName: "Nitin Sequeira", campaignId: "camp3",
    title: "Wispr Flow — Nitin Sequeira IG Reel",
    url: "https://www.instagram.com/reel/DX_8x-Vznlm/",
    platform: "Instagram", goLiveDate: "2026-05-16", format: "Integration", status: "Live",
  },
  {
    id: "v15", creatorId: "c15", creatorName: "Kiran Kumar", campaignId: "camp3",
    title: "Wispr Flow — Kiran Kumar IG Reel",
    url: "https://www.instagram.com/reel/DX6rL-7BgIU/",
    platform: "Instagram", goLiveDate: "2026-05-12", format: "Integration", status: "Live",
  },
  {
    id: "v16", creatorId: "c16", creatorName: "Varun Agarwal", campaignId: "camp3",
    title: "Wispr Flow — Varun Agarwal IG Carousel",
    url: "https://www.instagram.com/p/DYBsQdpGsw1/",
    platform: "Instagram", goLiveDate: "2026-05-22", format: "Integration", status: "Live",
  },
  {
    id: "v17", creatorId: "c17", creatorName: "Vishal Dayama", campaignId: "camp3",
    title: "Wispr Flow — Vishal Dayama IG Reel",
    url: "https://www.instagram.com/reel/DYMUY5VJpVh/",
    platform: "Instagram", goLiveDate: "2026-05-29", format: "Dedicated", status: "Live",
  },
  {
    id: "v18", creatorId: "c18", creatorName: "Jay Kapoor", campaignId: "camp3",
    title: "Wispr Flow — Jay Kapoor IG Reel",
    url: "https://www.instagram.com/reel/DX1uWLxPwwH/",
    platform: "Instagram", goLiveDate: "2026-05-09", format: "Integration", status: "Live",
  },
  {
    id: "v19", creatorId: "c19", creatorName: "Pritika Loonia", campaignId: "camp3",
    title: "Wispr Flow — Pritika Loonia IG Reel",
    url: "https://www.instagram.com/reel/DX34GZnxFAG/",
    platform: "Instagram", goLiveDate: "2026-05-10", format: "Integration", status: "Live",
  },
  {
    id: "v20", creatorId: "c20", creatorName: "Shivanshu Agrawal", campaignId: "camp3",
    title: "Wispr Flow — Shivanshu Agrawal IG Reel",
    url: "https://www.instagram.com/reel/DX6_jZnM3uY/",
    platform: "Instagram", goLiveDate: "2026-05-12", format: "Integration", status: "Live",
  },
  // ── LinkedIn Seeding ────────────────────────────────────────
  { id: "v21", creatorId: "c21", creatorName: "Anubhav Dubey",       campaignId: "camp4", title: "Wispr Flow — Anubhav Dubey LinkedIn",       url: "https://www.linkedin.com/posts/anubhavdubey_indore-is-not-bengaluru-tamil-nadu-is-not-share-7456371857936764928-E0Rm/",         platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v22", creatorId: "c22", creatorName: "Shivani Gera",        campaignId: "camp4", title: "Wispr Flow — Shivani Gera LinkedIn",        url: "https://www.linkedin.com/posts/shivanigera30_bangalore-has-a-productivity-hack-nobody-ugcPost-7456401431588286464-rPdP/",   platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v23", creatorId: "c23", creatorName: "Anant Sekhsaria",     campaignId: "camp4", title: "Wispr Flow — Anant Sekhsaria LinkedIn",     url: "https://www.linkedin.com/posts/anant5_wispr-flow-recently-ran-an-on-ground-campaign-share-7457039757613617152-IO-i/",    platform: "LinkedIn", goLiveDate: "2026-04-21", format: "Integration", status: "Live" },
  { id: "v24", creatorId: "c24", creatorName: "Parth Sanghvi",       campaignId: "camp4", title: "Wispr Flow — Parth Sanghvi LinkedIn",       url: "https://www.linkedin.com/posts/parth-sanghvi-humour-finance_siri-and-google-assistant-are-brilliant-pieces-share-7457757975584149504-uHRw/", platform: "LinkedIn", goLiveDate: "2026-04-22", format: "Integration", status: "Live" },
  { id: "v25", creatorId: "c25", creatorName: "CA Rahul Arora",      campaignId: "camp4", title: "Wispr Flow — CA Rahul Arora LinkedIn",      url: "https://www.linkedin.com/posts/rahul-arora29_wisprflow-startup-marketing-share-7456336599455256576-w0Xc/",                  platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v26", creatorId: "c26", creatorName: "Harinder Singh Pelia", campaignId: "camp4", title: "Wispr Flow — Harinder Singh Pelia LinkedIn", url: "https://www.linkedin.com/posts/harindersinghpelia_i-love-it-when-founders-dont-get-defensive-share-7456610108899352576-TY-1/",  platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v27", creatorId: "c27", creatorName: "Adityan Kayalakal",   campaignId: "camp4", title: "Wispr Flow — Adityan Kayalakal LinkedIn",   url: "https://www.linkedin.com/posts/adityanmktng_most-brands-dont-fail-because-they-make-activity-7456338537697705985-zRf9/",    platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v28", creatorId: "c28", creatorName: "Jeet Chandan",        campaignId: "camp4", title: "Wispr Flow — Jeet Chandan LinkedIn",        url: "https://www.linkedin.com/posts/jeetchandan_something-ive-been-thinking-about-from-the-share-7456616762650857472-QOEq/",      platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v29", creatorId: "c29", creatorName: "Prateek Malpani",     campaignId: "camp4", title: "Wispr Flow — Prateek Malpani LinkedIn",     url: "https://www.linkedin.com/posts/prateekmalpani_ive-been-using-wispr-flow-for-a-bit-now-activity-7456014037730869248-sSNm/",    platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  { id: "v30", creatorId: "c30", creatorName: "Saransh Anand",       campaignId: "camp4", title: "Wispr Flow — Saransh Anand LinkedIn",       url: "https://www.linkedin.com/posts/saransh-anand_lyft-bought-a-startup-just-to-put-ads-on-activity-7457045814855618560-Qbi7/",    platform: "LinkedIn", goLiveDate: "2026-04-21", format: "Integration", status: "Live" },
  { id: "v31", creatorId: "c31", creatorName: "Rohit Singh",         campaignId: "camp4", title: "Wispr Flow — Rohit Singh LinkedIn",         url: "https://www.linkedin.com/posts/rohitsingh1387_in-13-years-of-working-with-global-firms-ugcPost-7456008947116900352-h_lz/",     platform: "LinkedIn", goLiveDate: "2026-04-20", format: "Integration", status: "Live" },
  // ── LinkedIn MTW ────────────────────────────────────────────
  { id: "v32", creatorId: "c32", creatorName: "Jhalak",               campaignId: "camp5", title: "Wispr at MTW — Jhalak",               url: "https://www.linkedin.com/posts/jhalakkkk_mumbai-tech-week-was-basically-me-running-activity-7467085372976533504-04cs/",               platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v33", creatorId: "c33", creatorName: "Rishika Maheshwari",   campaignId: "camp5", title: "Wispr at MTW — Rishika Maheshwari",   url: "https://www.linkedin.com/posts/rishika-maheswari-9a996a250_we-all-think-at-150-words-per-minute-but-ugcPost-7467095232984256512-iwri/",   platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v34", creatorId: "c34", creatorName: "Sagar Kumar",          campaignId: "camp5", title: "Wispr at MTW — Sagar Kumar",          url: "https://www.linkedin.com/posts/sagarkumar9525_at-mumbai-tech-week-i-watched-someone-spend-ugcPost-7467868806267301888-0qv_/",          platform: "LinkedIn", goLiveDate: "2026-05-18", format: "Integration", status: "Live" },
  { id: "v35", creatorId: "c35", creatorName: "Suryakant Chaurasiya", campaignId: "camp5", title: "Wispr at MTW — Suryakant",            url: "https://www.linkedin.com/posts/suryakantchaurasiya_i-spent-2-days-at-mumbai-tech-week-surrounded-ugcPost-7467030827537752064-dIKI/",   platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v36", creatorId: "c36", creatorName: "Bhavya Taneja",        campaignId: "camp5", title: "Wispr at MTW — Bhavya Taneja",        url: "https://www.linkedin.com/posts/bhavya-taneja-b08a12105_forget-bangalore-traffic-why-does-noone-share-7466804578894675968-TkJv/",        platform: "LinkedIn", goLiveDate: "2026-05-16", format: "Integration", status: "Live" },
  { id: "v37", creatorId: "c37", creatorName: "Jayesh Marathe",       campaignId: "camp5", title: "Wispr at MTW — Jayesh Marathe",       url: "https://www.linkedin.com/posts/jayeshmarathe2011_i-dont-build-software-i-build-ev-infrastructure-ugcPost-7467175703734824960-_RJp/", platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v38", creatorId: "c38", creatorName: "Riyasha Jaiswal",      campaignId: "camp5", title: "Wispr at MTW — Riyasha",              url: "https://www.linkedin.com/posts/riyasha-jaiswal-765071199_came-back-from-mumbai-tech-week-to-200-messages-activity-7467051342801342465-C4jS/", platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v39", creatorId: "c39", creatorName: "Riya Thukral",         campaignId: "camp5", title: "Wispr at MTW — Riya Thukral",         url: "https://www.linkedin.com/posts/riyathukral-ic_nobody-talks-about-the-most-exhausting-part-activity-7467450644929433601-s1lR/",       platform: "LinkedIn", goLiveDate: "2026-05-18", format: "Integration", status: "Live" },
  { id: "v40", creatorId: "c40", creatorName: "Supriya Purohit",      campaignId: "camp5", title: "Wispr at MTW — Supriya",              url: "https://www.linkedin.com/posts/supriyapurohit27_mumbaitechweek-productmanagement-productdesign-activity-7468536661610758145-ds_i/",     platform: "LinkedIn", goLiveDate: "2026-05-21", format: "Integration", status: "Live" },
  { id: "v41", creatorId: "c41", creatorName: "Raunak Yadush",        campaignId: "camp5", title: "Wispr at MTW — Raunak Yadush",        url: "https://www.linkedin.com/posts/raunakyadush_coding-is-faster-ai-is-share-7468497853850570752-sdD8/",                                  platform: "LinkedIn", goLiveDate: "2026-05-21", format: "Integration", status: "Live" },
  { id: "v42", creatorId: "c42", creatorName: "Vikram Kushwaha",      campaignId: "camp5", title: "Wispr at MTW — Vikram Kushwaha",      url: "https://www.linkedin.com/posts/vikram-kushwaha-73101023a_voice-to-text-never-works-for-developers-share-7467576642287128576-5AbB/",      platform: "LinkedIn", goLiveDate: "2026-05-18", format: "Integration", status: "Live" },
  { id: "v43", creatorId: "c43", creatorName: "Yogesh Lakhpatani",    campaignId: "camp5", title: "Wispr at MTW — Yogesh Lakhpatani",    url: "https://www.linkedin.com/posts/yogesh-lakhpatani-172839180_mumbai-tech-week-gave-me-ideas-a-lot-of-share-7468280443730096128-M5Aq/",    platform: "LinkedIn", goLiveDate: "2026-05-20", format: "Integration", status: "Live" },
  { id: "v44", creatorId: "c44", creatorName: "Pratyaksh Sharma",     campaignId: "camp5", title: "Wispr at MTW — Pratyaksh Sharma",     url: "https://www.linkedin.com/posts/pratyaksh-sharma-9b308753_wisprflow-mumbaitechweek-productivity-share-7467514500750094336-dSqc/",         platform: "LinkedIn", goLiveDate: "2026-05-18", format: "Integration", status: "Live" },
  { id: "v45", creatorId: "c45", creatorName: "Sonali Malhotra",      campaignId: "camp5", title: "Wispr at MTW — Sonali Malhotra",      url: "https://www.linkedin.com/posts/sonali-malhotra23_my-rule-at-conferences-if-you-dont-follow-ugcPost-7467180354051948545-pucF/",          platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v46", creatorId: "c46", creatorName: "Kriti Khanna",         campaignId: "camp5", title: "Wispr at MTW — Kriti Khanna",         url: "https://www.linkedin.com/posts/kritiiii_i-went-to-mumbai-tech-week-looking-for-the-ugcPost-7467195227183886336-obhC/",             platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v47", creatorId: "c47", creatorName: "Vijay Chollangi",      campaignId: "camp5", title: "Wispr at MTW — Vijay Chollangi",      url: "https://www.linkedin.com/posts/vijay-chollangi-3230abcd12271_ai-productivity-artificialintelligence-activity-7467488940661485568-AS56/", platform: "LinkedIn", goLiveDate: "2026-05-18", format: "Integration", status: "Live" },
  { id: "v48", creatorId: "c48", creatorName: "Avani Rathore",        campaignId: "camp5", title: "Wispr at MTW — Avani Rathore",        url: "https://www.linkedin.com/posts/avanirathore_people-who-send-4-minute-voice-notes-at-work-share-7467168795334291458-AC73/",          platform: "LinkedIn", goLiveDate: "2026-05-17", format: "Integration", status: "Live" },
  { id: "v49", creatorId: "c49", creatorName: "Aashish Jhunjhunwala", campaignId: "camp5", title: "Wispr at MTW — Aashish Jhunjhunwala", url: "https://www.linkedin.com/posts/aashish-jhunjhunwala_at-goldman-and-bcg-i-never-thought-about-activity-7466826146685579264-5axC/",    platform: "LinkedIn", goLiveDate: "2026-05-16", format: "Integration", status: "Live" },
  // ── Wispr × WLDD June 2026 — Instagram ─────────────────────
  { id: "v50", creatorId: "c50", creatorName: "infoby_shree",       campaignId: "camp6", title: "Wispr Flow — infoby_shree IG Reel",         url: "https://www.instagram.com/reel/DZXUbN9qNmI/",               platform: "Instagram", goLiveDate: "2026-06-07", format: "Integration", status: "Live" },
  { id: "v51", creatorId: "c51", creatorName: "insta__nirav",        campaignId: "camp6", title: "Wispr Flow — insta__nirav IG Reel",          url: "https://www.instagram.com/reel/DZXW7oqsqIf/",               platform: "Instagram", goLiveDate: "2026-06-09", format: "Integration", status: "Live" },
  { id: "v52", creatorId: "c52", creatorName: "kochu.ai",            campaignId: "camp6", title: "Wispr Flow — kochu.ai IG Reel",              url: "https://www.instagram.com/reel/DZXSVpBygnD/",               platform: "Instagram", goLiveDate: "2026-06-09", format: "Integration", status: "Live" },
  { id: "v53", creatorId: "c53", creatorName: "financewithjobi",     campaignId: "camp6", title: "Wispr Flow — financewithjobi IG Reel",       url: "https://www.instagram.com/reel/DZmwJA2Jzz_/",               platform: "Instagram", goLiveDate: "2026-06-15", format: "Integration", status: "Live" },
  { id: "v54", creatorId: "c54", creatorName: "prettymuchbusiness",  campaignId: "camp6", title: "Wispr Flow — prettymuchbusiness IG Reel",    url: "https://www.instagram.com/reel/DZpZdqCRGFy/",               platform: "Instagram", goLiveDate: "2026-06-15", format: "Integration", status: "Live" },
  // ── Wispr × WLDD June 2026 — YouTube ───────────────────────
  { id: "v55", creatorId: "c55", creatorName: "Apple Wale Bhaiya",   campaignId: "camp6", title: "10 Mac Apps To Fix 10 Mac Problems!",        url: "https://youtu.be/KtZwESJLohc",                               platform: "YouTube",   goLiveDate: "2026-06-10", format: "Integration", status: "Live" },
  { id: "v56", creatorId: "c56", creatorName: "ezsnippet",           campaignId: "camp6", title: "VIBE Coding is DEAD 💀",                     url: "https://www.youtube.com/watch?v=G0YnO9rown0",                platform: "YouTube",   goLiveDate: "2026-06-10", format: "Integration", status: "Live" },
  { id: "v57", creatorId: "c57", creatorName: "Vaibhav Kadnar",      campaignId: "camp6", title: "\"BORING\" Businesses That Are Printing Money", url: "https://youtu.be/szGD3CmhulY",                           platform: "YouTube",   goLiveDate: "2026-06-13", format: "Integration", status: "Live" },
  { id: "v58", creatorId: "c58", creatorName: "bisboworld",          campaignId: "camp6", title: "Ola's Krutrim AI failure vs Sarvam",         url: "https://youtu.be/uuxdQx9EvVg",                               platform: "YouTube",   goLiveDate: "2026-06-13", format: "Integration", status: "Live" },
  { id: "v59", creatorId: "c59", creatorName: "Akber Shaikh",        campaignId: "camp6", title: "Internship Strategy",                        url: "https://youtu.be/HgsoWFIaT18",                               platform: "YouTube",   goLiveDate: "2026-06-19", format: "Integration", status: "Live" },
  { id: "v60", creatorId: "c60", creatorName: "WhyBhanshu",          campaignId: "camp6", title: "FIFA World Cup cost breakdown",               url: "https://youtu.be/cjp0IXYbw6I",                               platform: "YouTube",   goLiveDate: "2026-06-20", format: "Integration", status: "Live" },
  { id: "v61", creatorId: "c61", creatorName: "Mohammed Fraz",       campaignId: "camp6", title: "Wispr Flow — Mohammed Fraz YouTube",         url: "https://www.youtube.com/@mohammedfraz",                      platform: "YouTube",   goLiveDate: "2026-06-21", format: "Integration", status: "Live" },
  { id: "v62", creatorId: "c62", creatorName: "Think Wings",         campaignId: "camp6", title: "Wispr Flow — Think Wings YouTube",           url: "https://www.youtube.com/@thinkwings",                         platform: "YouTube",   goLiveDate: "2026-06-27", format: "Integration", status: "Scheduled" },
  { id: "v63", creatorId: "c63", creatorName: "Full Disclosure",     campaignId: "camp6", title: "Wispr Flow — Full Disclosure YouTube",       url: "https://www.youtube.com/@fulldisclosureyt",                   platform: "YouTube",   goLiveDate: "2026-06-30", format: "Integration", status: "Scheduled" },
  { id: "v64", creatorId: "c64", creatorName: "Technical Suneja",    campaignId: "camp6", title: "Wispr Flow — Technical Suneja YouTube",      url: "https://www.youtube.com/@technicalsuneja",                    platform: "YouTube",   goLiveDate: "2026-07-03", format: "Integration", status: "Scheduled" },
  { id: "v65", creatorId: "c65", creatorName: "Dhaval Kataria",      campaignId: "camp6", title: "Wispr Flow — Dhaval Kataria YouTube",        url: "https://www.youtube.com/@dhavalkataria",                      platform: "YouTube",   goLiveDate: "2026-07-07", format: "Integration", status: "Scheduled" },
  { id: "v66", creatorId: "c66", creatorName: "Tharun Speaks",       campaignId: "camp6", title: "Wispr Flow — Tharun Speaks YouTube",         url: "https://www.youtube.com/@tharunspeaks",                       platform: "YouTube",   goLiveDate: "2026-07-10", format: "Integration", status: "Scheduled" },
  // ── Coding First — June 2026 (YouTube) ─────────────────────
  { id: "v67", creatorId: "c67", creatorName: "Coding with Sagar",  campaignId: "camp7", title: "Wispr Flow — Coding with Sagar YouTube",   url: "https://www.youtube.com/watch?v=2tagcO5v9aw",   platform: "YouTube", goLiveDate: "2026-06-05", format: "Integration", status: "Live" },
  { id: "v68", creatorId: "c68", creatorName: "Nishant Chahar",     campaignId: "camp7", title: "Wispr Flow — Nishant Chahar YouTube",      url: "https://youtu.be/78z_gw5rh6s",                  platform: "YouTube", goLiveDate: "2026-06-08", format: "Integration", status: "Live" },
  { id: "v69", creatorId: "c69", creatorName: "Saumya Singh",       campaignId: "camp7", title: "Wispr Flow — Saumya Singh YouTube",        url: "https://youtu.be/mJOUQ700KaY",                  platform: "YouTube", goLiveDate: "2026-06-03", format: "Integration", status: "Live" },
  { id: "v70", creatorId: "c70", creatorName: "Pavan Lalwani",      campaignId: "camp7", title: "Wispr Flow — Pavan Lalwani YouTube",       url: "https://www.youtube.com/watch?v=OrJpkD7XHt0",   platform: "YouTube", goLiveDate: "2026-06-17", format: "Integration", status: "Live" },
  { id: "v71", creatorId: "c71", creatorName: "Mehul Mohan",        campaignId: "camp7", title: "Wispr Flow — Mehul Mohan YouTube",         url: "https://youtu.be/y--xkGbsmZc",                  platform: "YouTube", goLiveDate: "2026-06-12", format: "Integration", status: "Live" },
  { id: "v72", creatorId: "c72", creatorName: "Sheryians Coding",   campaignId: "camp7", title: "Wispr Flow — Sheryians Coding YouTube",    url: "https://www.youtube.com/@sheryians",             platform: "YouTube", goLiveDate: "2026-06-01", format: "Integration", status: "Live" },
  { id: "v73", creatorId: "c73", creatorName: "Engineering Digest", campaignId: "camp7", title: "Wispr Flow — Engineering Digest YouTube",  url: "https://www.youtube.com/@engineeringdigest",     platform: "YouTube", goLiveDate: "2026-06-06", format: "Integration", status: "Live" },
  { id: "v74", creatorId: "c74", creatorName: "Arsh Goyal",         campaignId: "camp7", title: "Wispr Flow — Arsh Goyal YouTube",          url: "https://www.youtube.com/@arshgoyal",             platform: "YouTube", goLiveDate: "2026-06-23", format: "Integration", status: "Scheduled" },
  { id: "v75", creatorId: "c75", creatorName: "Code And Bug",       campaignId: "camp7", title: "Wispr Flow — Code And Bug YouTube",        url: "https://www.youtube.com/@codeandbug",            platform: "YouTube", goLiveDate: "2026-06-20", format: "Integration", status: "Live" },
  { id: "v76", creatorId: "c76", creatorName: "Astro",              campaignId: "camp7", title: "Wispr Flow — Astro YouTube",               url: "https://youtu.be/TRSfMlEnLJc",                  platform: "YouTube", goLiveDate: "2026-06-10", format: "Integration", status: "Live" },
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
  { videoId: "v7", views: 10700, likes: 427, comments: 38, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, impressions: 288100, recordedAt: "2026-06-20" },
  // AOS Aevy TV — 8 JPEG Drive screenshots (12–18 Mar 2026 session)
  {
    videoId: "v8", views: 80156, likes: 4146, comments: 153, shares: 1115, saves: 1096, reposts: 64,
    watchTimeMinutes: 16562, avgWatchTimeSec: 17, skipRate: 54.9,
    accountsReached: 49799, profileFollows: 92,
    clickThroughs: 0, recordedAt: "2026-03-18",
  },
  // AOS Arjun Vaidya — arjun_insight.jpg (Drive, 17–18 Mar 2026)
  {
    videoId: "v9", views: 33563, likes: 540, comments: 166, shares: 86, saves: 237, reposts: 7,
    watchTimeMinutes: 4228, profileFollows: 18,
    clickThroughs: 0, recordedAt: "2026-03-18",
  },
  // AOS Maitri Mangal — insights shared as video; data pending
  { videoId: "v10", views: 0, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0, recordedAt: "2026-03-18" },
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
  { videoId: "v55", views: 10858,  likes: 489,  comments: 139, shares: 0, watchTimeMinutes: 0, clickThroughs: 168,  recordedAt: "2026-06-22" },
  { videoId: "v56", views: 146817, likes: 7962, comments: 406, shares: 0, watchTimeMinutes: 0, clickThroughs: 1740, recordedAt: "2026-06-22" },
  { videoId: "v57", views: 122900, likes: 4636, comments: 209, shares: 0, watchTimeMinutes: 0, clickThroughs: 438,  recordedAt: "2026-06-22" },
  { videoId: "v58", views: 48473,  likes: 889,  comments: 70,  shares: 0, watchTimeMinutes: 0, clickThroughs: 51,   recordedAt: "2026-06-22" },
  { videoId: "v59", views: 17367,  likes: 1279, comments: 250, shares: 0, watchTimeMinutes: 0, clickThroughs: 96,   recordedAt: "2026-06-22" },
  { videoId: "v60", views: 4370,   likes: 275,  comments: 45,  shares: 0, watchTimeMinutes: 0, clickThroughs: 65,   recordedAt: "2026-06-22" },
  { videoId: "v61", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 1,    recordedAt: "2026-06-22" }, // post link missing
  { videoId: "v62", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 1,    recordedAt: "2026-06-22" }, // not yet live
  { videoId: "v63", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 0,    recordedAt: "2026-06-22" },
  { videoId: "v64", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 1,    recordedAt: "2026-06-22" },
  { videoId: "v65", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 0,    recordedAt: "2026-06-22" },
  { videoId: "v66", views: 0,      likes: 0,    comments: 0,   shares: 0, watchTimeMinutes: 0, clickThroughs: 0,    recordedAt: "2026-06-22" },
  // Coding First — June 2026 — views scraped Jun 22; clickThroughs from Dub
  { videoId: "v67", views: 45000, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 179, recordedAt: "2026-06-22" },
  { videoId: "v68", views: 10000, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 219, recordedAt: "2026-06-22" },
  { videoId: "v69", views: 90000, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 46,  recordedAt: "2026-06-22" },
  { videoId: "v70", views: 23000, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 41,  recordedAt: "2026-06-22" },
  { videoId: "v71", views: 6000,  likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 60,  recordedAt: "2026-06-22" },
  { videoId: "v72", views: 25000, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 0,   recordedAt: "2026-06-22" }, // no UTM data
  { videoId: "v73", views: 9000,  likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 1,   recordedAt: "2026-06-22" },
  { videoId: "v74", views: 2500,  likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 1,   recordedAt: "2026-06-22" },
  { videoId: "v75", views: 12000, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 1,   recordedAt: "2026-06-22" }, // codeandbug Dub slug
  { videoId: "v76", views: 2500,  likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, clickThroughs: 25,  recordedAt: "2026-06-22" }, // astrokj Dub slug
];

// MTW referral signups — tracked via wisprflow.ai/r/* short links in LinkedIn posts
// attributionSource: "Manual" (short link click → signup, not Dub API)
// Total confirmed MTW signups: 200
export const installs: InstallRecord[] = [
  { id: "i1",  videoId: "v32", creatorId: "c32", campaignId: "camp5", installs: 1,   attributionSource: "Manual", date: "2026-05-17", revenue: 0 },
  { id: "i2",  videoId: "v33", creatorId: "c33", campaignId: "camp5", installs: 7,   attributionSource: "Manual", date: "2026-05-17", revenue: 0 },
  { id: "i3",  videoId: "v36", creatorId: "c36", campaignId: "camp5", installs: 13,  attributionSource: "Manual", date: "2026-05-16", revenue: 0 },
  { id: "i4",  videoId: "v38", creatorId: "c38", campaignId: "camp5", installs: 16,  attributionSource: "Manual", date: "2026-05-17", revenue: 0 },
  { id: "i5",  videoId: "v41", creatorId: "c41", campaignId: "camp5", installs: 132, attributionSource: "Manual", date: "2026-05-21", revenue: 0 },
  { id: "i6",  videoId: "v44", creatorId: "c44", campaignId: "camp5", installs: 3,   attributionSource: "Manual", date: "2026-05-18", revenue: 0 },
  { id: "i7",  videoId: "v45", creatorId: "c45", campaignId: "camp5", installs: 10,  attributionSource: "Manual", date: "2026-05-17", revenue: 0 },
  { id: "i8",  videoId: "v48", creatorId: "c48", campaignId: "camp5", installs: 18,  attributionSource: "Manual", date: "2026-05-17", revenue: 0 },
  // Wispr × WLDD June 2026 — UTM signup counts from Dub dashboard (ref.wisprflow.ai/*)
  { id: "i9",  videoId: "v55", creatorId: "c55", campaignId: "camp6", installs: 21,  attributionSource: "Dub", date: "2026-06-10", revenue: 35616 },
  { id: "i10", videoId: "v56", creatorId: "c56", campaignId: "camp6", installs: 190, attributionSource: "Dub", date: "2026-06-10", revenue: 0 },
  { id: "i11", videoId: "v57", creatorId: "c57", campaignId: "camp6", installs: 8,   attributionSource: "Dub", date: "2026-06-13", revenue: 0 },
  { id: "i12", videoId: "v59", creatorId: "c59", campaignId: "camp6", installs: 2,   attributionSource: "Dub", date: "2026-06-19", revenue: 0 },
  { id: "i13", videoId: "v60", creatorId: "c60", campaignId: "camp6", installs: 1,   attributionSource: "Dub", date: "2026-06-20", revenue: 0 },
  // Coding First — June 2026 — UTM signups from Dub
  { id: "i14", videoId: "v67", creatorId: "c67", campaignId: "camp7", installs: 6,   attributionSource: "Dub", date: "2026-06-05", revenue: 0 },
  { id: "i15", videoId: "v68", creatorId: "c68", campaignId: "camp7", installs: 7,   attributionSource: "Dub", date: "2026-06-08", revenue: 0 },
  { id: "i16", videoId: "v69", creatorId: "c69", campaignId: "camp7", installs: 3,   attributionSource: "Dub", date: "2026-06-03", revenue: 0 },
  { id: "i17", videoId: "v70", creatorId: "c70", campaignId: "camp7", installs: 2,   attributionSource: "Dub", date: "2026-06-17", revenue: 0 },
  { id: "i18", videoId: "v71", creatorId: "c71", campaignId: "camp7", installs: 2,   attributionSource: "Dub", date: "2026-06-12", revenue: 0 },
];

export const costs: Cost[] = [
  // Finnet — "Commercials" column from sheet (INR, gross = net — agency fee not itemised)
  { videoId: "v1",  creatorId: "c1",  campaignId: "camp1", grossCost: 400000, agencyFee: 0, netCost: 400000, currency: "INR" },
  { videoId: "v2",  creatorId: "c2",  campaignId: "camp1", grossCost: 300000, agencyFee: 0, netCost: 300000, currency: "INR" },
  { videoId: "v3",  creatorId: "c3",  campaignId: "camp1", grossCost: 200000, agencyFee: 0, netCost: 200000, currency: "INR" },
  { videoId: "v4",  creatorId: "c4",  campaignId: "camp1", grossCost: 12000,  agencyFee: 0, netCost: 12000,  currency: "INR" },
  { videoId: "v5",  creatorId: "c5",  campaignId: "camp1", grossCost: 275000, agencyFee: 0, netCost: 275000, currency: "INR" },
  { videoId: "v6",  creatorId: "c6",  campaignId: "camp1", grossCost: 160000, agencyFee: 0, netCost: 160000, currency: "INR" },
  // CA Nandini (v7) — no cost in sheet YT section; omitted
  // AOS — USD costs × ₹84
  { videoId: "v8",  creatorId: "c8",  campaignId: "camp2", grossCost: 378000, agencyFee: 0, netCost: 378000, currency: "INR" }, // $4,500
  { videoId: "v9",  creatorId: "c9",  campaignId: "camp2", grossCost: 161280, agencyFee: 0, netCost: 161280, currency: "INR" }, // $1,920
  { videoId: "v10", creatorId: "c10", campaignId: "camp2", grossCost: 420000, agencyFee: 0, netCost: 420000, currency: "INR" }, // $5,000
  // Owled — "Commercials (INR)" column from sheet (exact figures as entered)
  { videoId: "v11", creatorId: "c11", campaignId: "camp3", grossCost: 420000,  agencyFee: 0, netCost: 420000,  currency: "INR" },
  { videoId: "v12", creatorId: "c12", campaignId: "camp3", grossCost: 150000,  agencyFee: 0, netCost: 150000,  currency: "INR" },
  { videoId: "v13", creatorId: "c13", campaignId: "camp3", grossCost: 90086,   agencyFee: 0, netCost: 90086,   currency: "INR" },
  { videoId: "v14", creatorId: "c14", campaignId: "camp3", grossCost: 140000,  agencyFee: 0, netCost: 140000,  currency: "INR" },
  { videoId: "v15", creatorId: "c15", campaignId: "camp3", grossCost: 240000,  agencyFee: 0, netCost: 240000,  currency: "INR" },
  { videoId: "v16", creatorId: "c16", campaignId: "camp3", grossCost: 132063,  agencyFee: 0, netCost: 132063,  currency: "INR" },
  { videoId: "v17", creatorId: "c17", campaignId: "camp3", grossCost: 550000,  agencyFee: 0, netCost: 550000,  currency: "INR" },
  { videoId: "v18", creatorId: "c18", campaignId: "camp3", grossCost: 363172,  agencyFee: 0, netCost: 363172,  currency: "INR" },
  { videoId: "v19", creatorId: "c19", campaignId: "camp3", grossCost: 550000,  agencyFee: 0, netCost: 550000,  currency: "INR" },
  { videoId: "v20", creatorId: "c20", campaignId: "camp3", grossCost: 550000,  agencyFee: 0, netCost: 550000,  currency: "INR" },
  // LinkedIn MTW — costs from sheet (INR)
  { videoId: "v32", creatorId: "c32", campaignId: "camp5", grossCost: 22000,  agencyFee: 0, netCost: 22000,  currency: "INR" },
  { videoId: "v33", creatorId: "c33", campaignId: "camp5", grossCost: 20000,  agencyFee: 0, netCost: 20000,  currency: "INR" },
  { videoId: "v34", creatorId: "c34", campaignId: "camp5", grossCost: 30000,  agencyFee: 0, netCost: 30000,  currency: "INR" },
  { videoId: "v35", creatorId: "c35", campaignId: "camp5", grossCost: 30000,  agencyFee: 0, netCost: 30000,  currency: "INR" },
  { videoId: "v36", creatorId: "c36", campaignId: "camp5", grossCost: 17000,  agencyFee: 0, netCost: 17000,  currency: "INR" },
  { videoId: "v37", creatorId: "c37", campaignId: "camp5", grossCost: 20000,  agencyFee: 0, netCost: 20000,  currency: "INR" },
  { videoId: "v38", creatorId: "c38", campaignId: "camp5", grossCost: 40000,  agencyFee: 0, netCost: 40000,  currency: "INR" },
  { videoId: "v39", creatorId: "c39", campaignId: "camp5", grossCost: 26000,  agencyFee: 0, netCost: 26000,  currency: "INR" },
  { videoId: "v40", creatorId: "c40", campaignId: "camp5", grossCost: 30000,  agencyFee: 0, netCost: 30000,  currency: "INR" },
  { videoId: "v41", creatorId: "c41", campaignId: "camp5", grossCost: 40000,  agencyFee: 0, netCost: 40000,  currency: "INR" },
  { videoId: "v42", creatorId: "c42", campaignId: "camp5", grossCost: 16000,  agencyFee: 0, netCost: 16000,  currency: "INR" },
  { videoId: "v43", creatorId: "c43", campaignId: "camp5", grossCost: 16000,  agencyFee: 0, netCost: 16000,  currency: "INR" },
  { videoId: "v44", creatorId: "c44", campaignId: "camp5", grossCost: 10000,  agencyFee: 0, netCost: 10000,  currency: "INR" },
  { videoId: "v45", creatorId: "c45", campaignId: "camp5", grossCost: 20000,  agencyFee: 0, netCost: 20000,  currency: "INR" },
  { videoId: "v46", creatorId: "c46", campaignId: "camp5", grossCost: 20000,  agencyFee: 0, netCost: 20000,  currency: "INR" },
  { videoId: "v47", creatorId: "c47", campaignId: "camp5", grossCost: 40000,  agencyFee: 0, netCost: 40000,  currency: "INR" },
  { videoId: "v48", creatorId: "c48", campaignId: "camp5", grossCost: 70000,  agencyFee: 0, netCost: 70000,  currency: "INR" },
  { videoId: "v49", creatorId: "c49", campaignId: "camp5", grossCost: 55000,  agencyFee: 0, netCost: 55000,  currency: "INR" },
  // LinkedIn Seeding — no cost data in sheet (organic seeding)
  // Wispr × WLDD June 2026 — no cost data available in sheet yet
  // Coding First — June 2026 — costs from "coding first - june" tab, Sheet 1
  // Column D = quoted, Column G = net negotiated. Source: gviz API, 22 Jun 2026
  { videoId: "v67", creatorId: "c67", campaignId: "camp7", grossCost: 179000, agencyFee: 0, netCost: 150000, currency: "INR" }, // Coding with Sagar
  { videoId: "v68", creatorId: "c68", campaignId: "camp7", grossCost: 286000, agencyFee: 0, netCost: 200000, currency: "INR" }, // Nishant Chahar
  { videoId: "v69", creatorId: "c69", campaignId: "camp7", grossCost: 177000, agencyFee: 0, netCost: 150000, currency: "INR" }, // Saumya Singh
  { videoId: "v70", creatorId: "c70", campaignId: "camp7", grossCost: 160000, agencyFee: 0, netCost: 140000, currency: "INR" }, // Pavan Lalwani
  { videoId: "v71", creatorId: "c71", campaignId: "camp7", grossCost: 165000, agencyFee: 0, netCost: 165000, currency: "INR" }, // Mehul Mohan
  { videoId: "v72", creatorId: "c72", campaignId: "camp7", grossCost: 100000, agencyFee: 0, netCost:  75000, currency: "INR" }, // Sheryians Coding
  { videoId: "v73", creatorId: "c73", campaignId: "camp7", grossCost:  41000, agencyFee: 0, netCost:  41000, currency: "INR" }, // Engineering Digest
  { videoId: "v74", creatorId: "c74", campaignId: "camp7", grossCost: 143000, agencyFee: 0, netCost: 143000, currency: "INR" }, // Arsh Goyal
  { videoId: "v75", creatorId: "c75", campaignId: "camp7", grossCost:  56000, agencyFee: 0, netCost:  56000, currency: "INR" }, // Code And Bug
  { videoId: "v76", creatorId: "c76", campaignId: "camp7", grossCost:  62000, agencyFee: 0, netCost:  62000, currency: "INR" }, // Astro
];

// ── Derived metrics ──────────────────────────────────────────

export function getCreatorMetrics(creatorId: string): CreatorMetrics {
  const creatorVideos = videos.filter((v) => v.creatorId === creatorId);
  const videoIds = new Set(creatorVideos.map((v) => v.id));

  const creatorPerfs = performances.filter((p) => videoIds.has(p.videoId));
  const creatorInstalls = installs.filter((i) => i.creatorId === creatorId);
  const creatorCosts = costs.filter((c) => c.creatorId === creatorId);

  const totalViews = creatorPerfs.reduce((s, p) => s + p.views, 0);
  const totalClicks = creatorPerfs.reduce((s, p) => s + p.clickThroughs, 0);
  const totalInstallsCount = creatorInstalls.reduce((s, i) => s + i.installs, 0);
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
    return p && p.views > 0 && c.netCost > 0 ? c.netCost / p.views : 0;
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

export function getAllCreatorMetrics(): CreatorMetrics[] {
  return creators.map((c) => getCreatorMetrics(c.id));
}

export function getCampaignStats(campaignId: string) {
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) return null;
  const videoIds = new Set(videos.filter((v) => v.campaignId === campaignId).map((v) => v.id));
  const spent = costs.filter((c) => c.campaignId === campaignId).reduce((s, c) => s + c.netCost, 0);
  const totalInstallsCount = installs.filter((i) => i.campaignId === campaignId).reduce((s, i) => s + i.installs, 0);
  const totalViews = performances.filter((p) => videoIds.has(p.videoId)).reduce((s, p) => s + p.views, 0);
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
