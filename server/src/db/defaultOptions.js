// Starting topic and hymn lists for the default_options table.
// Admins can add or remove entries from the admin dashboard; these are only
// used to fill the table the first time the database is opened.

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

module.exports = {
  DEFAULT_OPTIONS: {
    topics: GOSPEL_TOPICS,
    hymns: HYMNS,
  },
};
