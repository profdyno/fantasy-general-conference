const crypto = require('crypto');
const { getDb } = require('./database');

const db = getDb();

// Admin password
const adminPassword = 'genconf2026';
const hash = crypto.createHash('sha256').update(adminPassword).digest('hex');
db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('admin_password_hash', hash);

// ── Sessions (shared names) ──────────────────────────────────────────────────
const SESSION_NAMES = [
  'Saturday Morning',
  'Saturday Afternoon',
  'Saturday Evening',
  'Sunday Morning',
  'Sunday Afternoon',
];

// ── Leaders list ─────────────────────────────────────────────────────────────
const LEADERS = [
  'President Dallin H. Oaks',
  'President Henry B. Eyring',
  'President D. Todd Christofferson',
  'President Dieter F. Uchtdorf',
  'Elder David A. Bednar',
  'Elder Quentin L. Cook',
  'Elder Neil L. Andersen',
  'Elder Ronald A. Rasband',
  'Elder Gary E. Stevenson',
  'Elder Dale G. Renlund',
  'Elder Gerrit W. Gong',
  'Elder Ulisses Soares',
  'Elder Patrick Kearon',
  'Elder Gérald Caussé',
  'Elder Clark G. Gilbert',
];

// ── Option lists ─────────────────────────────────────────────────────────────
const US_LOCATIONS = [
  'Anchorage, Alaska','Fairbanks, Alaska','Birmingham, Alabama','Huntsville, Alabama',
  'Mobile, Alabama','Little Rock, Arkansas','Bentonville, Arkansas',
  'Phoenix, Arizona','Tucson, Arizona','Mesa, Arizona','Flagstaff, Arizona',
  'Bakersfield, California','Fresno, California','Los Angeles, California',
  'Oakland, California','Sacramento, California','San Diego, California',
  'San Francisco, California','San Jose, California','Modesto, California',
  'Riverside, California','Ventura, California',
  'Colorado Springs, Colorado','Denver, Colorado','Fort Collins, Colorado','Grand Junction, Colorado',
  'Hartford, Connecticut','New Haven, Connecticut',
  'Wilmington, Delaware','Washington, D.C.',
  'Jacksonville, Florida','Miami, Florida','Orlando, Florida','Tampa, Florida',
  'Tallahassee, Florida','Fort Myers, Florida','Pensacola, Florida',
  'Atlanta, Georgia','Savannah, Georgia','Augusta, Georgia',
  'Honolulu, Hawaii','Maui, Hawaii',
  'Boise, Idaho','Idaho Falls, Idaho','Twin Falls, Idaho','Pocatello, Idaho','Nampa, Idaho',
  'Chicago, Illinois','Springfield, Illinois','Peoria, Illinois','Naperville, Illinois',
  'Indianapolis, Indiana','Fort Wayne, Indiana','South Bend, Indiana',
  'Des Moines, Iowa','Cedar Rapids, Iowa','Davenport, Iowa',
  'Wichita, Kansas','Overland Park, Kansas','Topeka, Kansas',
  'Louisville, Kentucky','Lexington, Kentucky',
  'New Orleans, Louisiana','Baton Rouge, Louisiana','Shreveport, Louisiana',
  'Portland, Maine','Bangor, Maine',
  'Baltimore, Maryland','Frederick, Maryland',
  'Boston, Massachusetts','Worcester, Massachusetts','Springfield, Massachusetts',
  'Detroit, Michigan','Grand Rapids, Michigan','Lansing, Michigan','Ann Arbor, Michigan',
  'Minneapolis, Minnesota','Rochester, Minnesota','St. Paul, Minnesota',
  'Jackson, Mississippi','Hattiesburg, Mississippi',
  'Kansas City, Missouri','St. Louis, Missouri','Springfield, Missouri',
  'Billings, Montana','Missoula, Montana','Helena, Montana',
  'Omaha, Nebraska','Lincoln, Nebraska',
  'Las Vegas, Nevada','Reno, Nevada','Henderson, Nevada',
  'Manchester, New Hampshire','Nashua, New Hampshire',
  'Newark, New Jersey','Cherry Hill, New Jersey','Edison, New Jersey',
  'Albuquerque, New Mexico','Santa Fe, New Mexico','Las Cruces, New Mexico',
  'New York City, New York','Buffalo, New York','Rochester, New York','Syracuse, New York','Albany, New York',
  'Charlotte, North Carolina','Raleigh, North Carolina','Durham, North Carolina',
  'Greensboro, North Carolina','Wilmington, North Carolina','Asheville, North Carolina',
  'Fargo, North Dakota','Bismarck, North Dakota',
  'Columbus, Ohio','Cleveland, Ohio','Cincinnati, Ohio','Dayton, Ohio',
  'Oklahoma City, Oklahoma','Tulsa, Oklahoma','Norman, Oklahoma',
  'Portland, Oregon','Salem, Oregon','Eugene, Oregon','Bend, Oregon',
  'Philadelphia, Pennsylvania','Pittsburgh, Pennsylvania','Harrisburg, Pennsylvania',
  'Providence, Rhode Island',
  'Charleston, South Carolina','Columbia, South Carolina','Greenville, South Carolina',
  'Sioux Falls, South Dakota','Rapid City, South Dakota',
  'Nashville, Tennessee','Memphis, Tennessee','Knoxville, Tennessee','Chattanooga, Tennessee',
  'Houston, Texas','Dallas, Texas','San Antonio, Texas','Austin, Texas','Fort Worth, Texas',
  'El Paso, Texas','McAllen, Texas','Lubbock, Texas','Amarillo, Texas','Corpus Christi, Texas',
  'Salt Lake City, Utah','Provo, Utah','Ogden, Utah','St. George, Utah','Logan, Utah',
  'Cedar City, Utah','Lehi, Utah','Heber City, Utah','Tooele, Utah','Vernal, Utah',
  'Burlington, Vermont','Montpelier, Vermont',
  'Virginia Beach, Virginia','Richmond, Virginia','Chesapeake, Virginia','Roanoke, Virginia',
  'Seattle, Washington','Spokane, Washington','Tacoma, Washington','Vancouver, Washington',
  'Olympia, Washington','Tri-Cities, Washington',
  'Charleston, West Virginia','Morgantown, West Virginia',
  'Milwaukee, Wisconsin','Madison, Wisconsin','Green Bay, Wisconsin',
  'Cheyenne, Wyoming','Casper, Wyoming',
  'San Juan, Puerto Rico','Guam',
];

const WORLD_LOCATIONS = [
  'Buenos Aires, Argentina','Córdoba, Argentina','Mendoza, Argentina','Rosario, Argentina',
  'Sydney, Australia','Melbourne, Australia','Brisbane, Australia','Perth, Australia','Adelaide, Australia',
  'Salzburg, Austria','Vienna, Austria',
  'Cochabamba, Bolivia','La Paz, Bolivia','Santa Cruz, Bolivia',
  'São Paulo, Brazil','Rio de Janeiro, Brazil','Brasília, Brazil','Curitiba, Brazil',
  'Belo Horizonte, Brazil','Recife, Brazil','Fortaleza, Brazil','Manaus, Brazil','Porto Alegre, Brazil',
  'Phnom Penh, Cambodia','Siem Reap, Cambodia',
  'Calgary, Canada','Edmonton, Canada','Vancouver, Canada','Toronto, Canada',
  'Montreal, Canada','Ottawa, Canada','Winnipeg, Canada','Halifax, Canada',
  'Santiago, Chile','Concepción, Chile','Antofagasta, Chile',
  'Bogotá, Colombia','Medellín, Colombia','Cali, Colombia','Barranquilla, Colombia',
  'San José, Costa Rica',
  'Kinshasa, DR Congo','Lubumbashi, DR Congo','Mbuji-Mayi, DR Congo',
  'Santo Domingo, Dominican Republic','Santiago, Dominican Republic',
  'Quito, Ecuador','Guayaquil, Ecuador',
  'San Salvador, El Salvador','Santa Ana, El Salvador',
  'London, England','Manchester, England','Birmingham, England','Leeds, England',
  'Edinburgh, Scotland','Cardiff, Wales',
  'Suva, Fiji','Nadi, Fiji',
  'Paris, France','Lyon, France','Marseille, France',
  'Berlin, Germany','Munich, Germany','Frankfurt, Germany','Hamburg, Germany',
  'Accra, Ghana','Kumasi, Ghana','Cape Coast, Ghana',
  'Guatemala City, Guatemala','Quetzaltenango, Guatemala',
  'Port-au-Prince, Haiti',
  'Tegucigalpa, Honduras','San Pedro Sula, Honduras',
  'Hong Kong, China',
  'New Delhi, India','Mumbai, India','Bangalore, India','Hyderabad, India','Chennai, India',
  'Jakarta, Indonesia','Surabaya, Indonesia',
  'Dublin, Ireland',
  'Rome, Italy','Milan, Italy',
  'Abidjan, Ivory Coast','Yamoussoukro, Ivory Coast',
  'Kingston, Jamaica',
  'Tokyo, Japan','Osaka, Japan','Sapporo, Japan','Fukuoka, Japan',
  'Nairobi, Kenya','Mombasa, Kenya',
  'Monrovia, Liberia',
  'Antananarivo, Madagascar',
  'Kuala Lumpur, Malaysia',
  'Mexico City, Mexico','Guadalajara, Mexico','Monterrey, Mexico','Puebla, Mexico',
  'Tijuana, Mexico','Mérida, Mexico','Oaxaca, Mexico','Cancún, Mexico',
  'Maputo, Mozambique','Beira, Mozambique',
  'Auckland, New Zealand','Wellington, New Zealand','Christchurch, New Zealand','Hamilton, New Zealand',
  'Managua, Nicaragua',
  'Lagos, Nigeria','Abuja, Nigeria','Port Harcourt, Nigeria','Ibadan, Nigeria',
  'Oslo, Norway',
  'Panama City, Panama',
  'Port Moresby, Papua New Guinea',
  'Asunción, Paraguay','Ciudad del Este, Paraguay',
  'Lima, Peru','Arequipa, Peru','Trujillo, Peru','Cusco, Peru',
  'Manila, Philippines','Cebu City, Philippines','Davao, Philippines','Quezon City, Philippines',
  'Lisbon, Portugal','Porto, Portugal',
  'Apia, Samoa',
  'Freetown, Sierra Leone',
  'Johannesburg, South Africa','Cape Town, South Africa','Durban, South Africa','Pretoria, South Africa',
  'Seoul, South Korea','Busan, South Korea',
  'Madrid, Spain','Barcelona, Spain',
  'Stockholm, Sweden','Gothenburg, Sweden',
  'Taipei, Taiwan','Kaohsiung, Taiwan',
  'Dar es Salaam, Tanzania','Dodoma, Tanzania',
  'Bangkok, Thailand','Chiang Mai, Thailand',
  "Nuku'alofa, Tonga",
  'Kampala, Uganda',
  'Kyiv, Ukraine','Dnipro, Ukraine',
  'Montevideo, Uruguay',
  'Caracas, Venezuela','Maracaibo, Venezuela',
  'Hanoi, Vietnam','Ho Chi Minh City, Vietnam',
  'Harare, Zimbabwe','Bulawayo, Zimbabwe',
];

// Official Gospel Topics from churchofjesuschrist.org
const GOSPEL_TOPICS = [
  'Aaronic Priesthood','Abortion','Abrahamic Covenant','Abuse','Addiction','Adoption',
  'Adversity','Agency and Accountability','Apostasy','Atonement of Jesus Christ',
  'Baptism','Baptisms for the Dead','Bible','Book of Mormon',
  'Caring for Those in Need','Celestial Kingdom','Charity','Chastity','Children of God',
  'Christmas','Church Organization','Commandments','Conscience','Consecration',
  'Conversion','Covenant','Creation','Dating and Courtship',
  'Death, Physical','Death, Spiritual','Debt','Disabilities','Diversity and Unity',
  'Divorce','Easter','Education','Emergency Preparedness',
  'Endowment','Endure to the End','Environmental Stewardship and Conservation',
  'Eternal Life','Faith in Jesus Christ','Fall of Adam and Eve','Family',
  'Family Councils','Family Finances','Family History','Family Home Evening',
  'Fasting and Fast Offerings','First Vision','Food Storage','Foreordination',
  'Forgiveness','Gambling','Garments','Gathering of Israel','Gifts of the Spirit',
  'God the Father','Godhead','Gospel','Grace','Gratitude','Grief','Happiness',
  'Health','Heaven','Heavenly Parents','Hell','Holy Ghost','Home Evening',
  'Honesty','Hope','Humility','Jesus Christ','Joseph Smith','Judgment','Justice',
  'Kingdoms of Glory','Light of Christ','Love','Marriage','Media',
  'Melchizedek Priesthood','Mercy','Millennium','Ministering','Miracles',
  'Missionary Work','Modesty','Mortality','Mother in Heaven','Music',
  'Obedience','Ordinances','Paradise','Parenting','Patriarchal Blessings',
  'Peace','Plan of Salvation','Pornography','Prayer','Premortal Life',
  'Priesthood','Priesthood Blessing','Priesthood Keys','Prophets',
  'Quorum of the Twelve Apostles','Relief Society','Religious Freedom',
  'Repentance','Restoration of the Gospel','Restoration of the Priesthood',
  'Resurrection','Revelation','Reverence','Sabbath Day','Sacrament',
  'Sacrament Meeting','Sacrifice','Salvation','Satan','Scriptures','Sealing',
  'Second Coming of Jesus Christ','Self-Reliance','Service','Sin',
  'Single Adult Members','Soul','Spirit World','Spiritual Experiences',
  'Spiritual Gifts','Stewardship','Suicide','Teaching the Gospel',
  'Temples','Temptation','Ten Commandments','Testimony','Tithing',
  'Transgression','Truth','Unity','Virtue','War','Witness',
  'Women in the Church','Word of Wisdom','Worship','Zion',
];

const HYMNS = [
  'A Poor Wayfaring Man of Grief','Abide with Me','All Creatures of Our God and King',
  'Amazing Grace','As I Search the Holy Scriptures','Be Still My Soul',
  'Because I Have Been Given Much','Called to Serve','Choose the Right',
  'Come Come Ye Saints','Come Follow Me','Come Thou Fount of Every Blessing',
  'Count Your Blessings','Dear to the Heart of the Shepherd',
  'Did You Think to Pray','Each Life That Touches Ours for Good',
  'God Be with You Till We Meet Again','High on the Mountain Top',
  'Hope of Israel','How Firm a Foundation','How Great Thou Art',
  'I Am a Child of God','I Believe in Christ','I Know That My Redeemer Lives',
  'I Need Thee Every Hour','I Stand All Amazed','If You Could Hie to Kolob',
  'Israel Israel God Is Calling','Jesus the Very Thought of Thee',
  'Joy to the World','Lead Kindly Light','Let Us All Press On',
  'Lord I Would Follow Thee','Love at Home','Love One Another',
  'Master the Tempest Is Raging','Nearer My God to Thee',
  'Now Let Us Rejoice','O My Father','Praise to the Man',
  'Press Forward Saints','Redeemer of Israel','Rock of Ages',
  'Savior Redeemer of My Soul','Sweet Hour of Prayer','Sweet Is the Work',
  'The Iron Rod','The Lord Is My Shepherd','The Morning Breaks',
  'The Spirit of God','There Is Sunshine in My Soul Today',
  'We Thank Thee O God for a Prophet','Where Can I Turn for Peace',
  'With Wondering Awe','Ye Elders of Israel',
];

const COLORS = [
  'Red','Orange','Yellow','Green','Blue','Purple','Pink',
  'White','Black','Gray','Cream','Teal','Navy','Burgundy','Gold',
];

function createSessions(gameId) {
  const insert = db.prepare('INSERT INTO sessions (game_id, name, sort_order) VALUES (?, ?, ?)');
  const sessions = {};
  SESSION_NAMES.forEach((name, i) => {
    const result = insert.run(gameId, name, i + 1);
    sessions[name] = result.lastInsertRowid;
  });
  return sessions;
}

// ── Create Test Game ─────────────────────────────────────────────────────────
db.prepare('INSERT OR IGNORE INTO games (name, year, season, is_active) VALUES (?, ?, ?, ?)').run(
  'Test 2026 General Conference', 2026, 'test', 0
);

// ── Create April 2026 Game ───────────────────────────────────────────────────
const gameResult = db.prepare('INSERT OR IGNORE INTO games (name, year, season, is_active) VALUES (?, ?, ?, ?)').run(
  'April 2026 General Conference', 2026, 'april', 1
);
const game = db.prepare("SELECT * FROM games WHERE year = 2026 AND season = 'april'").get();
const sessions = createSessions(game.id);

const insertQ = db.prepare(`
  INSERT INTO questions (game_id, session_id, sort_order, text, question_type, options, scoring_type, points, bonus_points, tolerance, category, group_key, allow_after_lock)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let order = 0;
function addQ(opts) {
  insertQ.run(
    game.id,
    opts.session_id || null,
    order++,
    opts.text,
    opts.question_type,
    opts.options ? JSON.stringify(opts.options) : null,
    opts.scoring_type,
    opts.points || 10,
    opts.bonus_points || 0,
    opts.tolerance || null,
    opts.category || null,
    opts.group_key || null,
    opts.allow_after_lock || 0,
  );
}

// ── U.S. TEMPLES ─────────────────────────────────────────────────────────────
addQ({ text: 'U.S. Temple Location - Guess 1', question_type: 'city_us', scoring_type: 'contains', points: 10, category: 'U.S. Temples' });
addQ({ text: 'U.S. Temple Location - Guess 2', question_type: 'city_us', scoring_type: 'contains', points: 10, category: 'U.S. Temples' });

// ── WORLDWIDE TEMPLES ────────────────────────────────────────────────────────
addQ({ text: 'Worldwide Temple Location - Guess 1', question_type: 'city_world', scoring_type: 'contains', points: 10, category: 'Worldwide Temples' });
addQ({ text: 'Worldwide Temple Location - Guess 2', question_type: 'city_world', scoring_type: 'contains', points: 10, category: 'Worldwide Temples' });

// ── TOPICS ────────────────────────────────────────────────────────────────────
addQ({ text: 'Conference Topic - Guess 1', question_type: 'dropdown', options: GOSPEL_TOPICS, scoring_type: 'contains', points: 10, category: 'Topics' });
addQ({ text: 'Conference Topic - Guess 2', question_type: 'dropdown', options: GOSPEL_TOPICS, scoring_type: 'contains', points: 10, category: 'Topics' });

// ── SONGS ─────────────────────────────────────────────────────────────────────
addQ({ text: 'Hymn - Guess 1', question_type: 'dropdown', options: HYMNS, scoring_type: 'contains', points: 10, category: 'Songs' });
addQ({ text: 'Hymn - Guess 2', question_type: 'dropdown', options: HYMNS, scoring_type: 'contains', points: 10, category: 'Songs' });
addQ({ text: 'Hymn - Guess 3', question_type: 'dropdown', options: HYMNS, scoring_type: 'contains', points: 10, category: 'Songs' });
addQ({ text: 'Hymn - Guess 4', question_type: 'dropdown', options: HYMNS, scoring_type: 'contains', points: 10, category: 'Songs' });

// ── CHOIR CLOTHING ────────────────────────────────────────────────────────────
for (const name of SESSION_NAMES) {
  addQ({
    text: `Choir women's clothing color - ${name}`,
    question_type: 'select', options: COLORS, scoring_type: 'exact', points: 10,
    category: 'Choir Clothing', session_id: sessions[name],
  });
}

// ── CONDUCTING ────────────────────────────────────────────────────────────────
for (const name of SESSION_NAMES) {
  addQ({
    text: `Who will conduct - ${name}?`,
    question_type: 'select', options: LEADERS, scoring_type: 'exact', points: 10,
    category: 'Conducting', session_id: sessions[name],
  });
}

// ── QUICK PICKS ───────────────────────────────────────────────────────────────
addQ({ text: 'How many new temples will be announced?', question_type: 'multiple_choice', options: ['0 to 5', '6 to 10', '11+'], scoring_type: 'exact', points: 5, category: 'Quick Picks' });
addQ({ text: 'Will Uchtdorf tell a flight story?', question_type: 'yes_no', scoring_type: 'boolean', points: 5, category: 'Quick Picks' });
addQ({ text: 'What will the weather be on Saturday?', question_type: 'multi_select', options: ['Sunny', 'Cloudy', 'Rain', 'Snow'], scoring_type: 'contains', points: 5, category: 'Quick Picks' });
addQ({ text: 'Will there be a Youth Choir?', question_type: 'yes_no', scoring_type: 'boolean', points: 5, category: 'Quick Picks' });

// ── SPEAKERS ──────────────────────────────────────────────────────────────────
const sessionOptions = SESSION_NAMES;

for (const speaker of LEADERS) {
  addQ({
    text: 'Predicted Session',
    question_type: 'dropdown', options: sessionOptions, scoring_type: 'exact', points: 10,
    category: 'Speakers', group_key: speaker, allow_after_lock: 0,
  });
  addQ({
    text: 'Actual Session',
    question_type: 'dropdown', options: sessionOptions, scoring_type: 'exact', points: 5,
    category: 'Speakers', group_key: speaker, allow_after_lock: 1,
  });
  addQ({
    text: 'Topic',
    question_type: 'text', scoring_type: 'any_value', points: 5,
    category: 'Speakers', group_key: speaker, allow_after_lock: 1,
  });
  addQ({
    text: 'Prompting to...',
    question_type: 'text', scoring_type: 'none', points: 0,
    category: 'Speakers', group_key: speaker, allow_after_lock: 1,
  });
}

// ── OTHER SPEAKERS ────────────────────────────────────────────────────────────
const OTHER_SPEAKERS = [
  { group: 'Presidency of the Seventy', names: [
    'Elder Carl B. Cook','Elder S. Mark Palmer','Elder Marcus B. Nash',
    'Elder Michael T. Ringwood','Elder Arnulfo Valenzuela','Elder Edward Dube',
    'Elder Kevin R. Duncan',
  ]},
  { group: 'Presiding Bishopric', names: [
    'W. Christopher Waddell','L. Todd Budge','Sean Douglas',
  ]},
  { group: 'Young Men Presidency', names: [
    'Timothy L. Farnes','David J. Wunderli','Sean R. Dixon',
  ]},
  { group: 'Sunday School Presidency', names: [
    'Paul V. Johnson','Chad H. Webb','Gabriel W. Reid',
  ]},
  { group: 'Relief Society Presidency', names: [
    'Camille N. Johnson','J. Annette Dennis','Kristin M. Yee',
  ]},
  { group: 'Young Women Presidency', names: [
    'Emily Belle Freeman','Tamara W. Runia','Andrea Muñoz Spannaus',
  ]},
  { group: 'Primary Presidency', names: [
    'Susan H. Porter','Amy A. Wright','Tracy Y. Browning',
  ]},
];

addQ({
  text: 'Guess up to 5 other speakers (select up to 5)',
  question_type: 'checkbox_list', options: OTHER_SPEAKERS,
  scoring_type: 'checkbox_match', points: 5,
  category: 'Other Speakers',
});

console.log('Seed complete!');
console.log(`Game: ${game.name} (id: ${game.id})`);
console.log(`Sessions: ${SESSION_NAMES.length}`);
console.log(`Questions: ${order}`);
console.log(`Speakers: ${LEADERS.length}`);
console.log(`Admin password: ${adminPassword}`);
