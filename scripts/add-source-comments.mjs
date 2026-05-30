#!/usr/bin/env node
/**
 * One-off script to inject mock sourceComments into events.json and places.json.
 * Run: node scripts/add-source-comments.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../src/data");

const eventComments = {
  "riverside-jazz": [
    { source: "google", author: "Marta K.", date: "2026-05-12", rating: 5, text: "Magical atmosphere by the water. The jazz trio was excellent and the sunset view made it unforgettable." },
    { source: "facebook", author: "Tomasz W.", date: "2026-05-05", rating: 4, text: "Great vibe every Saturday. Gets busy after 8 pm — arrive early for a good spot near the stage." },
    { source: "eventbrite", author: "Anna L.", date: "2026-04-28", rating: 5, text: "Well organized, friendly staff, and the craft drinks menu is a nice touch. Will come back." },
  ],
  "farmers-market": [
    { source: "google", author: "Ewa P.", date: "2026-05-18", rating: 5, text: "Best Saturday morning routine in the city. Fresh bread, local honey, and the street food stalls are amazing." },
    { source: "facebook", author: "Piotr M.", date: "2026-05-11", rating: 4, text: "Very crowded after 10 am but worth it. Bring a reusable bag and cash for smaller vendors." },
    { source: "tripadvisor", author: "Sarah D.", date: "2026-04-20", rating: 5, text: "A must-visit for food lovers. Loved the artisan cheese stand and friendly community feel." },
  ],
  "street-art-walk": [
    { source: "google", author: "Jakub R.", date: "2026-05-08", rating: 5, text: "Our guide knew every mural's story. Hidden gems in alleys you'd never find on your own." },
    { source: "tripadvisor", author: "Claire B.", date: "2026-04-15", rating: 4, text: "Informative and visually stunning. Wear comfortable shoes — lots of walking on uneven pavement." },
    { source: "facebook", author: "Ola S.", date: "2026-05-01", rating: 5, text: "Perfect for art lovers and photographers. Small group size made it feel personal." },
  ],
  "kids-science-lab": [
    { source: "google", author: "Katarzyna N.", date: "2026-05-14", rating: 5, text: "My 8-year-old didn't want to leave. Hands-on experiments kept every kid engaged for two hours." },
    { source: "facebook", author: "Marcin H.", date: "2026-04-27", rating: 4, text: "Staff are patient and enthusiastic. Booking ahead helps on rainy weekends." },
    { source: "eventbrite", author: "Helen T.", date: "2026-05-03", rating: 5, text: "Great value for families. The volcano experiment was the highlight for our group." },
  ],
  "sunrise-yoga": [
    { source: "google", author: "Nina V.", date: "2026-05-20", rating: 5, text: "Peaceful start to the day under the oak trees. Instructor adjusts poses for all levels." },
    { source: "facebook", author: "Adam C.", date: "2026-05-06", rating: 4, text: "Free and welcoming. Mats provided — just show up a few minutes early." },
    { source: "eventbrite", author: "Lisa F.", date: "2026-04-22", rating: 5, text: "Calm, uncrowded, and the park setting is beautiful at dawn." },
  ],
  "tech-meetup": [
    { source: "google", author: "Dev User", date: "2026-05-10", rating: 4, text: "Solid lightning talks and good networking. Pizza ran out fast — grab some early." },
    { source: "facebook", author: "Karol Z.", date: "2026-04-30", rating: 5, text: "Friendly dev community. Great place to meet collaborators on side projects." },
    { source: "eventbrite", author: "Mike R.", date: "2026-05-02", rating: 4, text: "Monthly staple for local engineers. AI talk this month was especially interesting." },
  ],
  "heritage-walk": [
    { source: "google", author: "Barbara J.", date: "2026-05-16", rating: 5, text: "The guide brought centuries of history to life. Small groups mean you can actually hear everything." },
    { source: "tripadvisor", author: "James W.", date: "2026-04-18", rating: 5, text: "One of the best walking tours I've done. Stories about merchants and revolutions were fascinating." },
    { source: "facebook", author: "Zofia K.", date: "2026-05-04", rating: 4, text: "Wheelchair-friendly route and plenty of stops to rest. Highly recommend for history buffs." },
  ],
  "night-food-festival": [
    { source: "google", author: "Chris M.", date: "2026-05-22", rating: 4, text: "Incredible variety of street food. Gets packed after 9 pm — go earlier if you hate queues." },
    { source: "facebook", author: "Daria L.", date: "2026-05-15", rating: 5, text: "Best food night of the year. DJs, dessert bars, and vendors from all over the region." },
    { source: "eventbrite", author: "Tom H.", date: "2026-04-25", rating: 4, text: "Lively atmosphere on the waterfront. Bring cash and an appetite." },
  ],
  "community-garden": [
    { source: "google", author: "Irena S.", date: "2026-05-09", rating: 5, text: "Lovely community spirit. Picked up great urban gardening tips and swapped seeds with neighbors." },
    { source: "facebook", author: "Paweł D.", date: "2026-04-12", rating: 4, text: "Free, relaxed, and kid-friendly. Perfect afternoon for families who like nature." },
    { source: "tripadvisor", author: "Emma G.", date: "2026-05-01", rating: 5, text: "Hidden gem in the east side. The shared plots are inspiring." },
  ],
  "indie-cinema": [
    { source: "google", author: "Film Fan", date: "2026-05-17", rating: 5, text: "Wonderful selection of local shorts. Q&A with directors afterward was a real treat." },
    { source: "facebook", author: "Monika A.", date: "2026-04-28", rating: 4, text: "Intimate venue with subtitles available. Support regional filmmakers — you won't regret it." },
    { source: "eventbrite", author: "David K.", date: "2026-05-05", rating: 5, text: "Cozy art house vibe. Low crowd, high quality programming." },
  ],
  "running-club": [
    { source: "google", author: "Runner42", date: "2026-05-19", rating: 5, text: "Friendly 5K group run with a beautiful lakeside loop. Coffee afterward is the best part." },
    { source: "facebook", author: "Agata W.", date: "2026-05-12", rating: 4, text: "All paces welcome. Great way to meet people if you're new to the city." },
    { source: "facebook", author: "Ben P.", date: "2026-04-14", rating: 5, text: "Casual, no pressure, and the trail views are stunning in the morning light." },
  ],
  "senior-tea": [
    { source: "google", author: "Janina M.", date: "2026-05-21", rating: 5, text: "Warm, welcoming space. Board games, tea, and good conversation — exactly what the neighborhood needed." },
    { source: "facebook", author: "Stefan B.", date: "2026-05-07", rating: 5, text: "Free entry and no reservation hassle. Quiet room makes it easy to chat." },
    { source: "tripadvisor", author: "Rose T.", date: "2026-04-19", rating: 4, text: "Lovely afternoon activity for seniors. Staff are attentive and kind." },
  ],
};

const placeComments = {
  "old-town-riverside": [
    { source: "google", author: "Marta K.", date: "2026-05-14", rating: 5, text: "Perfect for an evening stroll. Benches along the water and stunning sunset views." },
    { source: "tripadvisor", author: "John S.", date: "2026-04-22", rating: 5, text: "Peaceful promenade away from the busy square. Great for picnics." },
    { source: "facebook", author: "Ewa L.", date: "2026-05-02", rating: 4, text: "Always open and wheelchair accessible. Our favorite spot to unwind." },
  ],
  "greenwood-park": [
    { source: "google", author: "Tomasz P.", date: "2026-05-18", rating: 5, text: "Huge oaks, good playgrounds, and plenty of space for jogging or yoga." },
    { source: "yelp", author: "Amy R.", date: "2026-04-30", rating: 4, text: "Gets busy on sunny weekends but still feels spacious. Dawn visits are quietest." },
    { source: "facebook", author: "Natalia W.", date: "2026-05-10", rating: 5, text: "Family favorite. Kids love the meadows and we love the shade in summer." },
  ],
  "crystal-lake": [
    { source: "google", author: "Piotr Z.", date: "2026-05-20", rating: 5, text: "Calm lake with a lovely 3 km trail. Kayak rental in summer is worth it." },
    { source: "tripadvisor", author: "Laura M.", date: "2026-04-15", rating: 4, text: "Beautiful year-round. Feeding ducks is fun for kids — bring bird-safe snacks." },
    { source: "facebook", author: "Kasia H.", date: "2026-05-08", rating: 5, text: "Open 24 hours and free. Best at sunrise when the water is mirror-still." },
  ],
  "greenwood-forest-trail": [
    { source: "google", author: "Adam F.", date: "2026-05-16", rating: 5, text: "Shaded forest path — cool even on hot days. Saw woodpeckers and deer tracks." },
    { source: "tripadvisor", author: "Chris B.", date: "2026-04-28", rating: 4, text: "Well marked trail through pine and birch. Wear proper shoes after rain." },
    { source: "yelp", author: "Monika S.", date: "2026-05-05", rating: 5, text: "Fresh air escape from the city. Mushroom foragers were friendly and helpful." },
  ],
  "city-history-museum": [
    { source: "google", author: "Barbara T.", date: "2026-05-22", rating: 5, text: "Excellent exhibitions from medieval times onward. Audio guides and rooftop terrace are highlights." },
    { source: "tripadvisor", author: "Michael D.", date: "2026-04-20", rating: 4, text: "Interactive displays keep kids engaged. Closed Mondays — plan ahead." },
    { source: "facebook", author: "Zofia R.", date: "2026-05-11", rating: 5, text: "Fully wheelchair accessible with elevator. Worth the entry fee." },
  ],
  "hilltop-castle": [
    { source: "google", author: "James L.", date: "2026-05-19", rating: 5, text: "Panoramic city views from the hill. Ruins are atmospheric and well maintained." },
    { source: "tripadvisor", author: "Helen W.", date: "2026-04-25", rating: 5, text: "Explore at your own pace. Golden hour from the towers is spectacular." },
    { source: "facebook", author: "Marcin K.", date: "2026-05-06", rating: 4, text: "Steep paths in places but seating areas help. History lovers will enjoy this." },
  ],
  "botanical-gardens": [
    { source: "google", author: "Anna P.", date: "2026-05-21", rating: 5, text: "Rose pavilion and Japanese zen corner are stunning. Peaceful oasis all year." },
    { source: "tripadvisor", author: "Sophie G.", date: "2026-04-18", rating: 5, text: "Four hectares of themed gardens — easy to spend half a day here." },
    { source: "yelp", author: "Robert N.", date: "2026-05-09", rating: 4, text: "Stroller-friendly paths and greenhouse is a hit with toddlers." },
  ],
  "sunset-viewpoint": [
    { source: "google", author: "Ewa M.", date: "2026-05-23", rating: 5, text: "Best golden-hour views in the city. Small café nearby for a drink while you wait." },
    { source: "facebook", author: "Tomek J.", date: "2026-05-12", rating: 5, text: "Open 24/7 and free. Benches face the river valley — perfect for couples." },
    { source: "tripadvisor", author: "Kate H.", date: "2026-04-14", rating: 4, text: "Can get windy at night — bring a jacket. Worth every step up the hill." },
  ],
  "children-adventure-park": [
    { source: "google", author: "Katarzyna B.", date: "2026-05-17", rating: 5, text: "Kids adore the splash pad and mini train. Free entry makes it a no-brainer for families." },
    { source: "facebook", author: "Paweł S.", date: "2026-05-04", rating: 4, text: "Busy on weekends but well designed. Picnic areas and snack kiosks on site." },
    { source: "yelp", author: "Jenny L.", date: "2026-04-26", rating: 5, text: "Climbing frames for all ages. Stroller-friendly and lots of shade." },
  ],
  "old-town-square": [
    { source: "google", author: "Marek D.", date: "2026-05-20", rating: 5, text: "Historic heart of the city — cobblestones, cafés, street performers. Always lively." },
    { source: "tripadvisor", author: "Paul R.", date: "2026-04-22", rating: 4, text: "Beautiful architecture and great people-watching. Touristy but authentic." },
    { source: "facebook", author: "Ola K.", date: "2026-05-15", rating: 5, text: "Open around the clock. Evening atmosphere with lights is magical." },
  ],
  "waterfront-promenade": [
    { source: "google", author: "Chris A.", date: "2026-05-18", rating: 5, text: "Lively 2 km boardwalk with restaurants and public art. Perfect evening walk." },
    { source: "tripadvisor", author: "Maria F.", date: "2026-04-30", rating: 4, text: "Harbor views and benches every few meters. Wheelchair accessible throughout." },
    { source: "facebook", author: "Daniel W.", date: "2026-05-07", rating: 5, text: "Our go-to after dinner. Street musicians and sunset over the water." },
  ],
  "industrial-art-district": [
    { source: "google", author: "Art Lover", date: "2026-05-16", rating: 5, text: "Former factories turned galleries — murals and sculptures everywhere. Explore anytime." },
    { source: "tripadvisor", author: "Nina C.", date: "2026-04-12", rating: 4, text: "Open-air art you can visit on your own schedule. Great for photographers." },
    { source: "facebook", author: "Jakub M.", date: "2026-05-03", rating: 5, text: "Pop-up exhibitions change often. Industrial vibe meets creative energy." },
  ],
};

function injectComments(filePath, commentsMap) {
  const items = JSON.parse(readFileSync(filePath, "utf8"));
  for (const item of items) {
    item.sourceComments = commentsMap[item.id] ?? [];
  }
  writeFileSync(filePath, JSON.stringify(items, null, 2) + "\n");
}

injectComments(join(dataDir, "events.json"), eventComments);
injectComments(join(dataDir, "places.json"), placeComments);
console.log("Added sourceComments to events.json and places.json");
