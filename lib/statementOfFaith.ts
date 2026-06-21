export interface FaithSubsection {
  label: string;
  title: string;
  paragraphs: string[];
  scriptures: string[];
}

export interface FaithArticle {
  number: number;
  title: string;
  paragraphs: string[];
  subsections: FaithSubsection[];
  scriptures: string[];
}

export const STATEMENT_OF_FAITH_INTRO = {
  churchName: "ASHBURTON BAPTIST CHURCH",
  title: "Statement of Faith",
  draftLabel: "Draft Copy",
  adopted: "The following Articles of Faith were adopted by Ashburton Baptist Church, Canterbury, New Zealand from the ??/??/????.",
} as const;

export const STATEMENT_OF_FAITH_ARTICLES: FaithArticle[] = [
  {
    number: 1,
    title: "The Scriptures",
    paragraphs: ["The Holy Bible is the authority, inspiration, and sufficiency of the Scriptures, consisting of the writings of the prophets and apostles, as the faithful revelation of God’s character, will, and redemptive purposes. It was written by men divinely inspired and is the record of God’s revelation of Himself to man. It is a perfect treasure of divine instruction. It has God for its author, salvation for its end, and truth, without any mixture of error, for its matter. Therefore, all Scripture is totally true and trustworthy. It reveals the principles by which God judges us, and therefore is, and will remain to the end of the world, the true centre of Christian union, and the supreme standard by which all human conduct, creeds, and religious opinions should be tried. All scripture is a testimony to Christ, who is Himself the focus of divine revelation.", "It is inerrant and infallible in its original manuscript which is to be taken as verbally inspired."],
    subsections: [
    ],
    scriptures: ["Exodus 24:4; Deuteronomy 4:1-2; 17:19; Joshua. 8:34; Psalms 19:7-10; 119:105; 119:11, 89, 105, 140; Isaiah 34:16; 40:8; 55:17-18; Jeremiah. 15:16; 36:1-32; Matthew 5:17-18; 22:29; Luke 21:33; 24:44-46; John 5:39; 16:13-15; 17:17; Acts 2:16; 17:11; Romans 15:4; 16:25- 26; 2 Timothy 3:15-17; Hebrews 1:1-2; 4:12; 1 Peter 1:25; 2 Peter 1:19-21."],
  },
  {
    number: 2,
    title: "God",
    paragraphs: ["There is one and only one living and true God. God is self-existent, He is an intelligent, spiritual, and personal Being, the Creator of the heavens and earth in six days and rested on the seventh, establishing His created order as good, purposeful, and reflective of His wisdom and glory. Humanity was created in His image to know Him, worship Him, steward creation, and live in covenant fellowship with Him. Redeemer, Preserver, and Ruler of the universe. God is infinite in holiness and all other perfections. God is all-powerful and all-knowing; and His perfect knowledge extends to all things, past, present, and future, including the future decisions of His free creatures. To Him we owe the highest love, reverence, and obedience. The eternal triune God reveals Himself to us as Father, Son and Holy Spirit, with distinct personal attributes, but without division of nature, essence or being."],
    subsections: [
      {
        label: "A.",
        title: "God the Father",
        paragraphs: ["God as Father reigns with providential care over His universe, His creatures, and the flow of the stream of human history according to the purposes of His grace. He is all-powerful, all-knowing, all-loving, and all-wise. God is Father in truth to those who become children of God through faith in Jesus Christ. He is fatherly in His attitude toward all men."],
        scriptures: ["Genesis 1:1; 2:7; Exodus 3:14; 6:2-3; 15:11ff.; 20:1ff.; Leviticus 22:2; Deuteronomy 6:4; 32:6; 1 Chronicles 29:10; Psalms 19:1-3; Isaiah 43:3; 15; 64:8; Jeremiah 10:10; 17:13; Matthew 6:9ff.; 7:11; 23:9; 28:19; Mark 1:9-11; John 4:24; 5:26; 14:6-13; 17:1- 8; Acts 1:7; Romans 8:14-15; 1 Corinthians 8:6; Galatians 4:6; Ephesians 4:6; Col. 1:15; 1 Timothy 1:17; Hebrews 11:6; 12:9; 1 Peter 1:17; 1 John 5:7."],
      },
      {
        label: "B.",
        title: "God the Son",
        paragraphs: ["Christ is the eternal Son of God. In His incarnation as Jesus Christ, He was conceived of the Holy Spirit and born of the virgin Mary. Jesus perfectly revealed and did the will of God, taking upon Himself human nature with its demands and necessities and identifying Himself completely with mankind yet without sin. He honoured the divine law by His personal obedience, and in His substitutionary death on the cross, He made provision for the redemption of men from sin. He was raised from the dead with a glorified body and appeared to His disciples as the Person who was with them before His crucifixion. He ascended into heaven and is now exalted at the right hand of God where He is the One Mediator, fully God, fully man, in whose Person is effected the reconciliation between God and man. He will return in power and glory to judge the world and to consummate His redemptive mission. He now dwells in all believers as the living and ever-present Lord. He is the Messiah, the promised Son of David, the Seed of Abraham, the suffering Servant, and the eternal King."],
        scriptures: ["Genesis 18:1ff.; Psalms 2:7ff; 110:1ff.; Isaiah 7:14; 53; Matthew 1:18-23; 3:17; 8:29; 11:27; 14:33; 16:16, 27; 17:5, 27; 28:1-6, 19; Mark 1:1; 3:11; Luke 1:35; 4:41; 22:70; 24:46; John 1:1-18, 29; 10:30, 38; 11:25-27; 12:44-50; 14:7-11; 16:15-16, 28; 17:1-5, 21-22; 20:1-20, 28; Acts 1:9; 2:22-24; 2:32-36; 7:55-56; 9:4-5, 20; Romans 1:3-4; 3:23-26; 5:6- 21; 8:1-3, 34; 10:4; 1 Corinthians 1:30; 2:2; 8:6; 15:1-8, 24-28; 2 Corinthians 5:19-21; 8:9; Galatians 4:4-5; Ephesians 1:20; 3:11; 4:7-10; Philippians 2:5-11; Colossians 1:13-22; 2:9; 1 Thessalonians 4:14-18; 1 Timothy 2:5-6; 3:16; Titus 2:13-14; Hebrews 1:1-3; 4:14-15; 7:14-28; 9:12-15, 24-28; 12:2; 13:8; 1 Peter 2:21-25; 3:22; 1 John 1:7- 9; 3:2; 4:14-15; 5:9; 2 John 7-9; Revelation 1:13-16; 5:9-14; 12:10-11; 13:8; 19:16."],
      },
      {
        label: "C.",
        title: "God the Holy Spirit",
        paragraphs: ["The Holy Spirit is the Spirit of God, fully divine. He inspired holy men of old to write the Scriptures. Through illumination, He enables men to understand truth. He exalts Christ. He convicts of sin, of righteousness and of judgment. He calls men to the Savior, and effects regeneration. At the moment of regeneration, He baptizes every believer into the Body of Christ. He cultivates Christian character, comforts believers and bestows the spiritual gifts by which they serve God through His church. He seals the believer unto the day of final redemption. His presence in the Christian is the guarantee that God will bring the believer into the fullness of the stature of Christ. He enlightens and empowers the believer and the church in worship, evangelism, and service. He empowers for holy living, equips believers with spiritual gifts, and bears witness to Messiah."],
        scriptures: ["Genesis 1:2; Judges 14:6; Job 26:13; Psalms 51:11; 139:7ff.; Isaiah 61:1-3; Joel 2:28- 32; Matthew 1:18; 3:16; 4:1; 12:28-32; 28:19; Mark 1:10, 12; Luke 1:35; 4:1, 18-19; 11:13; 12:12; 24:49; John 4:24; 14:16-17, 26; 15:26; 16:7-15; Acts 1:8; 2:1-4, 38; 4:31; 5:3; 6:3; 7:55; 8:17, 39; 10:44; 13:2; 15:28; 16:6; 19:1-6; Romans 8:9-11-16, 26-27; 1 Corinthians 2:10-14; 3:16; 12:3-11, 13; Galatians 4:6; Galatians 5:22–23; Titus 3:5, Ephesians 1:13-14; 4:30; 5:18; 1 Thessalonians 5:19; 1 Timothy 3:16; 4:1; 2 Timothy 1:14; 3:16; Hebrews 9:8, 14; 2 Peter 1:21; 1 John 4:13; 5:6-7; Revelation 1:10; 22:17."],
      },
      {
        label: "D.",
        title: "God’s Covenant with Abraham, Isaac, Jacob, the further to David and the new covenant through Jesus’ blood",
        paragraphs: ["God established His covenant promises through Abraham, Isaac, and Jacob, choosing a people, Israel, through whom all nations of the earth would be blessed. To Abraham He promised descendants, land, and blessing; to Isaac and Jacob He confirmed His covenant faithfulness, revealing His sovereign plan to redeem and gather a people for Himself. further established His covenant through David, promising an everlasting kingdom and a royal descendant whose throne would endure forever. Through the Law, the Prophets, and the Psalms, God progressively revealed His purposes and foretold the coming Messiah—the Anointed One who would perfectly fulfill all righteousness, bear the sins of His people, and reign in justice and peace. God through Jesus’ blood, Jesus inaugurated the New Covenant promised by the prophets: the forgiveness of sins, the writing of God’s law upon the heart, reconciliation with God, and the indwelling presence of the Holy Spirit. This covenant is extended by grace through faith to all who believe. We believe that Jesus' resurrection from the dead seals the New Covenant and authenticates His claim to be Messiah."],
        scriptures: ["Genesis 12:1–3; Genesis 15:1–21; Genesis 17:1–8; Genesis 26:2–5; Genesis 28:13–15; Exodus 2:24; Galatians 3:8–9; Jeremiah 31:31–34; Ezekiel 36:25–27; Matthew 26:28; Luke 22:20; Romans 1:4; Acts 2:24–36; Hebrews 8:6–13; Hebrews 9:15; Hebrews 10:14–18; 1 Corinthians 15:17–22."],
      },
      {
        label: "D.",
        title: "God’s Faithfulness to Israel",
        paragraphs: ["In His faithfulness to Israel, even when they turned their back on Him, God shows His good character, being true to His word, never forgetting the eternal promises to be their God and to give them a land."],
        scriptures: ["Leviticus 26:44–45; Deuteronomy 7:7–9; Psalm 105:8–11; Jeremiah 31:35–37; Ezekiel 36:22–28; Romans 11:1–2; Romans 11:28–29; 2 Samuel 7:12–16; Psalm 2:6–12; Psalm 110:1–4; Isaiah 9:6–7; Isaiah 11:1–10; Jeremiah 23:5–6; Luke 24:44."],
      },
    ],
    scriptures: ["Genesis 1:1–31; Genesis 2:1–3; Genesis 2:15; Exodus 20:11; Psalm 19:1; Isaiah 45:18; Acts 17:24–28; Colossians 1:16–17; Revelation 4:11."],
  },
  {
    number: 3,
    title: "Man",
    paragraphs: ["Man is the special creation of God, made in His own image. He created them male and female as the crowning work of His creation. The gift of gender is thus part of the goodness of God’s creation. In the beginning man was innocent of sin and was endowed by his Creator with freedom of choice. By his free choice, man sinned against God and brought sin into the human race. Through the temptation of Satan, man transgressed the command of God, and fell from his original innocence, whereby his posterity inherited a nature and an environment inclined toward sin. Therefore, as soon as they are capable of moral action, they become transgressors and are under condemnation. Only the grace of God can bring man into His holy fellowship and enable man to fulfil the creative purpose of God. The sacredness of human personality is evident in that God created man in His own image, and in that Christ died for man; therefore, every person of every race possesses full dignity and is worthy of respect and Christian love."],
    subsections: [
      {
        label: "",
        title: "The Fall and the First Promise of Redemption",
        paragraphs: ["Tthrough the fall of humanity, sin entered the world, bringing separation from God, corruption of creation, and death. Yet from the beginning, God revealed His redemptive purpose, promising the coming Seed who would crush the serpent and restore what was lost."],
        scriptures: ["Genesis 3:1–24; Genesis 3:15; Romans 5:12–19; Romans 8:20–22; 1 Corinthians 15:21–22; 1 John 3:8; Revelation 12:9–11."],
      },
    ],
    scriptures: ["Genesis 1:26-30; 2:5, 7, 18-22; 3; 9:6; Psalms 1; 8:3-6; 32:1-5; 51:5; Isaiah 6:5; Jeremiah 17:5; Matthew 16:26; Acts 17:26-31; Romans 1:19-32; 3:10-18, 23; 5:6, 12, 19; 6:6; 7:14-25; 8:14-18, 29; 1 Corinthians 1:21-31; 15:19, 21-22; Ephesians 2:1-22; Colossians 1:21-22; 3:9-11."],
  },
  {
    number: 4,
    title: "Salvation",
    paragraphs: ["Salvation involves the redemption of the whole man and is offered freely to all who accept Jesus Christ as Lord and Savior who, by His own blood, obtained eternal redemption for the believer. In its broadest sense, salvation includes regeneration, justification, sanctification, and glorification. There is no salvation apart from personal faith in Jesus Christ as Lord. Salvation is by grace alone, through faith alone, in Messiah alone—not by works of the law or human merit. Through repentance and faith, believers are justified, adopted as children of God, sanctified by the Spirit, and assured of eternal life."],
    subsections: [
      {
        label: "A.",
        title: "",
        paragraphs: ["Regeneration, or the new birth, is a work of God’s grace whereby, believers become new creatures in Christ Jesus. It is a change of heart wrought by the Holy Spirit through conviction of sin to which the sinner responds in repentance toward God and faith in the Lord Jesus Christ. Repentance and faith are inseparable experiences of grace. Repentance is a genuine turning from sin toward God. Faith is the acceptance of Jesus Christ and commitment of the entire personality to Him as Lord and Savior."],
        scriptures: [],
      },
      {
        label: "B.",
        title: "",
        paragraphs: ["Justification is God’s gracious and full acquittal upon principles of His righteousness of all sinners who repent and believe in Christ. Justification brings the believer into a relationship of peace and favour with God."],
        scriptures: [],
      },
      {
        label: "C.",
        title: "",
        paragraphs: ["Sanctification is the experience, beginning in regeneration, by which the believer is set apart to God’s purposes, and is enabled to progress toward moral and spiritual maturity through the presence and power of the Holy Spirit dwelling in him. Growth in grace should continue throughout the regenerate person’s life."],
        scriptures: [],
      },
      {
        label: "D.",
        title: "",
        paragraphs: ["Glorification is the culmination of salvation and is the final blessed and abiding state of the redeemed."],
        scriptures: [],
      },
    ],
    scriptures: ["Genesis 3:15; Exodus 3:14-17; 6:2-8; Matthew 1:21; 4:17; 16:21-26; 27:22-28:6; Luke 1:68-69; 2:28-32; John 1:11-14, 29; 3:3-21, 36; 5:24; 10:9, 28-29; 15:1-16; 17:17; Acts 2:21; 4:12; 15:11; 16:30-31; 17:30-31; 20:32; Romans 1:16-18; 2:4; 3:23-28; 4:3ff.; 5:1; 5:8-10; 6:1-23; 8:1-18, 29-39; 10:9-10, 13; 13:11-14; Titus 3:4-7; 1 Corinthians 1:18, 30; 6:19-20; 15:10; 2 Corinthians 5:17-20; Galatians 2:16-20; 3:13; 5:22-25; 6:15; Ephesians 1:7; 2:8- 22; 4:11-16; Philippians 1:6; 2:12-13; Colossians 1:9-22; 3:1ff.; 1 Thessalonians 5:23-24; 2 Timothy 1:12; Titus 2:11-14; Hebrews 2:1-3; 5:8-9; 9:24-28; 11:1-12:8, 14; James 2:14- 26; 1 Peter 1:2-23; 1 John 1:6-2:11; Revelation 3:20; 21:1 to 22:5."],
  },
  {
    number: 5,
    title: "God’s Purpose of Grace",
    paragraphs: ["Election is the gracious purpose of God, according to which He regenerates, justifies, sanctifies, and glorifies sinners. It is consistent with the free agency of man and comprehends all the means in connection with the end. It is a glorious display of God’s sovereign goodness, and is infinitely wise, holy, and unchangeable. It excludes boasting and promotes humility.", "All true believers endure to the end. Those whom God has accepted in Christ, and sanctified by His Spirit, will never fall away from the state of grace, but shall persevere to the end. Believers may fall into sin through neglect and temptation, whereby they grieve the Spirit, impair their graces and comforts, and bring reproach on the cause of Christ and temporal judgments on themselves; yet they shall be kept by the power of God through faith unto salvation."],
    subsections: [
      {
        label: "A.",
        title: "The One Universal People of God",
        paragraphs: ["We believe in one holy, universal people of God, the assembly of all who belong to Messiah, called to worship, discipleship, holiness, justice, mercy, and the proclamation of the gospel to all nations."],
        scriptures: ["Matthew 28:18–20; Acts 2:42–47; Ephesians 4:1–16; Micah 6:8; James 1:27; 1 Peter 2:9–12; Revelation 7:9–10."],
      },
    ],
    scriptures: ["Genesis 12:1-3; Exodus 19:5-8; 1 Samuel 8:4-7, 19-22; Isaiah 5:1-7; Jeremiah 31:31ff.; Matthew 16:18-19; 21:28-45; 24:22, 31; 25:34; Luke 1:68-79; 2:29-32; 19:41-44; 24:44-48; John 1:12-14; 3:16; 5:24; 6:44-45, 65; 10:27-29; 15:16; 17:6, 12, 17-18; Acts 20:32; Romans 5:9-10; 8:28-39; 10:12-15; 11:5-7, 26-36; 1 Corinthians 1:1-2; 15:24- 28; Ephesians 1:4-23; 2:1-10; 3:1-11; Colossians 1:12-14; 2 Thessalonians 2:13-14; 2 Timothy 1:12; 2:10, 19; Hebrews 11:39-12:2; James 1:12;1 Peter 1:2-5, 13; 2:4-10; 1 John 1:7-9; 2:19; 3:2."],
  },
  {
    number: 6,
    title: "The Church",
    paragraphs: ["A New Testament church of the Lord Jesus Christ is an autonomous local congregation of baptized believers, associated by covenant in the faith and fellowship of the gospel; observing the two ordinances of Christ; governed by His laws; exercising the gifts, rights, and privileges invested in them by His word; and seeking to extend the gospel to the ends of the earth. Each congregation operates under the Lordship of Jesus Christ through democratic processes. In such a congregation each member is responsible and accountable to Christ as Lord. Its Scriptural officers are pastors and deacons. While both men and women are gifted for service in the church, the office of pastor is limited to men as qualified by Scripture.", "The New Testament speaks also of the church as the Body of Christ, which includes all the redeemed of all the ages, believers from every tribe, and tongue, and people, and nation."],
    subsections: [
    ],
    scriptures: ["Matthew 16:15-19; 18:15-20; Acts 2:41-42, 47; 5:11-14; 6:3-6; 13:1-3; 14:23, 27; 15:1- 30; 16:5; 20:28; Romans 1:7; 1 Corinthians 1:2; 3:16; 5:4-5; 7:17; 9:13-14; 12; Ephesians 1:22-23; 2:19-22; 3:8-11, 21; 5:22-32; Philippians 1:1; Colossians 1:18; I Timothy 2:9-14;1 Timothy 3:1-15; 4:14; Hebrews 11:39-40; 1 Peter 5:1-4; Revelation 2- 3; 21:2-3."],
  },
  {
    number: 7,
    title: "Baptism and the Lord’s Supper",
    paragraphs: ["Christian baptism is the immersion of a believer in water in the name of the Father, the Son, and the Holy Spirit. It is an act of obedience symbolizing the believer’s faith in a crucified, buried, and risen Savior; the believer’s death to sin; the burial of the old life; and the resurrection to walk in newness of life in Christ Jesus. It is a testimony to his faith in the final resurrection of the dead. Being a church ordinance, it is prerequisite to the privileges of church membership and to the Lord’s Supper.", "The Lord’s Supper is a symbolic act of obedience whereby members of the church, through partaking of the bread and the fruit of the vine, memorialize the death of the Redeemer and anticipate His second coming."],
    subsections: [
    ],
    scriptures: ["Matthew 3:13-17; 26:26-30; 28:19-20; Mark 1:9-11; 14:22-26; Luke 3:21-22; 22:19-20; John 3:23; Acts 2:41-42; 8:35-39; 16:30-33; Acts 20:7; Romans 6:3-5; 1 Corinthians 10:16, 21; 11:23-29; Colossians 2:12."],
  },
  {
    number: 8,
    title: "The Lord’s Day",
    paragraphs: ["The coming Day of the Lord, when God will intervene decisively in human history through the return of Jesus Christ to judge the living and the dead, punish wickedness, vindicate His righteousness, and establish the fullness of His everlasting Kingdom. This Day will bring judgment, wrath, and destruction upon the unrepentant, yet salvation, deliverance, and eternal joy for all who belong to Christ. It will culminate in the final judgment, the renewal of all things, and the creation of the new heavens and the new earth, where righteousness dwells and God will reign forever with His redeemed people. The bodily return of Jesus the Messiah, the resurrection of the dead, the final judgment, the restoration of all things, and the establishment of the new heavens and new earth, where God will dwell forever with His redeemed people."],
    subsections: [
    ],
    scriptures: ["Daniel 12:2; Joel 2:1–2; Joel 2:30–32; Amos 5:18–20; Isaiah 13:6–13; Zephaniah 1:14–18; Malachi 4:1–2; Matthew 24:29–31; Matthew 25:31–46; John 5:28–29; Acts 17:31; 1 Thessalonians 5:2–11; 2 Thessalonians 1:7–10; 2 Peter 3:10–13; Revelation 19:11–16; Revelation 20:11–15; Revelation 21:1–5."],
  },
  {
    number: 9,
    title: "Jews and Gentiles United in Messiah",
    paragraphs: ["Gentiles who trust in Messiah are grafted into the covenant people of God, sharing in the rich root of the promises given to Israel. Together, believing Jews and Gentiles are made one new humanity in Messiah, heirs according to the promise, without distinction in worth, dignity, or access to God."],
    subsections: [
    ],
    scriptures: ["Romans 11:17–24; Ephesians 2:11–22; Ephesians 3:4–6; Galatians 3:26–29; Colossians 3:11; 1 Peter 2:9–10; John 10:16."],
  },
  {
    number: 10,
    title: "The Kingdom",
    paragraphs: ["The Kingdom of God includes both His general sovereignty over the universe and His particular kingship over men who wilfully acknowledge Him as King. Particularly the Kingdom is the realm of salvation into which men enter by trustful, childlike commitment to Jesus Christ. Christians ought to pray and to labour that the Kingdom may come and God’s will be done on earth. The full consummation of the Kingdom awaits the return of Jesus Christ and the end of this age. We live in hope, awaiting the fullness of God’s kingdom, seeking to walk in covenant faithfulness, proclaim the good news of Messiah, and glorify God in all things."],
    subsections: [
    ],
    scriptures: ["Genesis 1:1; Isaiah 9:6-7; Jeremiah 23:5-6; Matthew 3:2; 4:8-10, 23; Matthew 6:33; 12:25-28; 13:1- 52; 25:31-46; 26:29; Mark 1:14-15; 9:1; Luke 4:43; 8:1; 9:2; 12:31-32; 17:20-21; 23:42; John 3:3; 18:36; Acts 1:6-7; 17:22-31; Romans 5:17; 8:19; Romans 12:1–2; 1 Corinthians 15:24- 28; Colossians 1:13; 3:1–4; Titus 2:11–14; Hebrews 10:23–25; 11:10, 16; 12:28; 1 Peter 1:13–16; 2:4-10; 4:13; 2 Peter 3:11–14; Revelation 1:6, 9; 5:10; 11:15; 21-22."],
  },
  {
    number: 11,
    title: "Last Things",
    paragraphs: ["God, in His own time and in His own way, will bring the world to its appropriate end. According to His promise, Jesus Christ will return personally and visibly in glory to the earth; the dead will be raised; and, Christ will judge all men in righteousness. The unrighteous will be consigned to Hell, the place of everlasting punishment. The righteous in their resurrected and glorified bodies will receive their reward and will dwell forever in Heaven with the Lord.", "The dead in Christ will rise first, then we who are alive and remain until the coming of the Lord shall be caught up together with them in the clouds to meet the Lord in the air. After the judgments of God upon this sinful world in the Great Tribulation, Jesus our Lord will come with His saints to establish His millennial kingdom."],
    subsections: [
    ],
    scriptures: ["Isaiah 2:4; 11:9; Matthew 16:27; 18:8-9; 19:28; 24:27, 30, 36, 44; 25:31′-46; 26:64; Mark 8:38; 9:43-48; Luke 12:40, 48; 16:19-26; 17:22-37; 21:27-28; John 14:1-3; Acts 1:11; 17:31; Romans 14:10; 1 Corinthians 4:5; 15:24-28, 35-58; 2 Corinthians 5:10; Philippians 3:20-21; Colossians 1:5; 3:4; 1 Thessalonians 4:14-18; 5:1ff., 2 Thessalonians 1:7ff.; 2; 1 Timothy 6:14; 2 Timothy 4:1, 8; Titus 2:13; Hebrews 9:27-28; James 5:8; 2 Peter 3:7ff.; 1 John 2:28; 3:2; Jude 14; Revelation 1:18; 3:11; 20:1-22:13."],
  },
  {
    number: 12,
    title: "Evangelism and Missions",
    paragraphs: ["It is the duty and privilege of every follower of Christ and of every church of the Lord Jesus Christ to endeavour to make disciples of all nations. The new birth of man’s spirit by God’s Holy Spirit means the birth of love for others. Missionary effort on the part of all rests thus upon a spiritual necessity of the regenerate life, and is expressly and repeatedly commanded in the teachings of Christ. The Lord Jesus Christ has commanded the preaching of the gospel to all nations. It is the duty of every child of God to seek constantly to win the lost to Christ by verbal witness undergirded by a Christian lifestyle, and by other methods in harmony with the gospel of Christ."],
    subsections: [
    ],
    scriptures: ["Genesis 12:1-3; Exodus 19:5-6; Isaiah 6:1-8; Matthews 9:37-38; 10:5-15; 13:18-30, 37- 43; 16:19; 22:9-10; 24:14; 28:18-20; Luke 10:1-18; 24:46-53; John 14:11-12; 15:7-8, 16; 17:15; 20:21; Acts 1:8; 2; 8:26-40; 10:42-48; 13:2-3; Romans 10:13-15; Ephesians 3:1-11; 1 Thessalonians 1:8; 2 Timothy 4:5; Hebrews 2:1-3; 11:39-12:2; 1 Peter 2:4-10; Revelation 22:17."],
  },
  {
    number: 13,
    title: "Education",
    paragraphs: ["Christianity is the faith of enlightenment and intelligence. In Jesus Christ abide all the treasures of wisdom and knowledge. All sound learning is, therefore, a part of our Christian heritage. The new birth opens all human faculties and creates a thirst for knowledge. Moreover, the cause of education in the Kingdom of Christ is co-ordinate with the causes of missions and general benevolence, and should receive along with these the liberal support of the churches. An adequate system of Christian education is necessary to a complete spiritual program for Christ’s people.", "In Christian education there should be a proper balance between academic freedom and academic responsibility. Freedom in any orderly relationship of human life is always limited and never absolute. The freedom of a teacher in a Christian school, college, or seminary is limited by the pre-eminence of Jesus Christ, by the authoritative nature of the Scriptures, and by the distinct purpose for which the school exists."],
    subsections: [
    ],
    scriptures: ["Deuteronomy 4:1, 5, 9, 14; 6:1-10; 31:12-13; Nehemiah 8:1-8; Job 28:28; Psalms 19:7ff.; 119:11; Proverbs 3:13ff.; 4:1-10; 8:1-7, 11; 15:14; Ecclesiastes 7:19; Matthew 5:2; 7:24ff.; 28:19-20; Luke 2:40; 1 Corinthians 1:18-31; Ephesians 4:11-16; Philippians 4:8; Colossians 2:3, 8-9; 1 Timothy 1:3-7; 2 Timothy 2:15; 3:14-17; Hebrews 5:12-6:3; James 1:5; 3:17."],
  },
  {
    number: 14,
    title: "Stewardship",
    paragraphs: ["God is the source of all blessings, temporal and spiritual; all that we have and are we owe to Him. Christians have a spiritual debtorship to the whole world, a holy trusteeship in the gospel, and a binding stewardship in their possessions. They are therefore under obligation to serve Him with their time, talents, and material possessions; and should recognize all these as entrusted to them to use for the glory of God and for helping others.", "According to the Scriptures, Christians should contribute of their means cheerfully, regularly, systematically, proportionately, and liberally for the advancement of the Redeemer’s cause on earth.", "The tithe is to be considered the starting place of Christian stewardship."],
    subsections: [
    ],
    scriptures: ["Genesis 14:20; Leviticus 27:30-32; Deuteronomy 8:18; Malachi 3:8-12; Matthew 6:1-4, 19-21; 19:21; 23:23; 25:14-29; Luke 12:16-21, 42; 16:1-13; Acts 2:44-47; 5:1-11; 17:24-25; 20:35; Romans 6:6-22; 12:1-2; 1 Corinthians 4:1-2; 6:19-20; 12; 16:1-4; 2 Corinthians 8-9; 12:15; Philippians 4:10-19; 1 Peter 1:18-19."],
  },
  {
    number: 15,
    title: "Cooperation and Mutual Commitment",
    paragraphs: ["Christ’s people should, as occasion requires, organize such associations and conventions as may best secure cooperation for the great objects of the Kingdom of God. Such organizations have no authority over one another or over the churches. They are voluntary and advisory bodies designed to elicit, combine, and direct the energies of our people in the most effective manner. Members of New Testament churches should cooperate with one another in carrying forward the missionary, educational, and benevolent ministries for the extension of Christ’s Kingdom. Christian unity in the New Testament sense is spiritual harmony and voluntary cooperation for common ends by various groups of Christ’s people. Cooperation is desirable between the various Christian denominations, when the end to be attained is itself justified, and when such cooperation involves no violation of conscience or compromise of loyalty to Christ and His Word as revealed in the New Testament."],
    subsections: [
    ],
    scriptures: ["Exodus 17:12; 18:17ff.; Judges 7:21; Ezra 1:3-4; 2:68-69; 5:14-15; Nehemiah 4; 8:1-5; Matthew 10:5-15; 20:1-16; 22:1-10; 28:19-20; Mark 2:3; Luke 10:1ff.; Acts 1:13-14; 2:1ff.; 4:31-37; 13:2-3; 15:1-35; 1 Corinthians 1:10-17; 3:5-15; 12; 2 Corinthians 8-9; Galatians 1:6-10; Ephesians 4:1-16; Philippians 1:15-18."],
  },
  {
    number: 16,
    title: "The Christian and the Social Order",
    paragraphs: ["All Christians are under obligation to seek to make the will of Christ supreme in our own lives and in human society. Means and methods used for the improvement of society and the establishment of righteousness among men can be truly and permanently helpful only when they are rooted in the regeneration of the individual by the saving grace of God in Jesus Christ. In the spirit of Christ, Christians should oppose racism, every form of greed, selfishness, and vice, and all forms of sexual immorality, including adultery, homosexuality, and pornography. We should work to provide for the orphaned, the needy, the abused, the aged, the helpless, and the sick. We should speak on behalf of the unborn and contend for the sanctity of all human life from conception to natural death. Every Christian should seek to bring industry, government, and society as a whole under the sway of the principles of righteousness, truth, and brotherly love. In order to promote these ends Christians should be ready to work with all men of good will in any good cause, always being careful to act in the spirit of love without compromising their loyalty to Christ and His truth.", "Therefore, the greatest contribution the Church can make to social betterment is to bring individuals to a heart-changing encounter with Jesus Christ."],
    subsections: [
    ],
    scriptures: ["Exodus 20:3-17; Leviticus 6:2-5; Deuteronomy 10:12; 27:17; Psalms 101:5; Micah 6:8; Zechariah 8:16; Matthew 5:13-16, 43-48; 22:36-40; 25:35; Mark 1:29-34; 2:3ff.; 10:21; Luke 4:18-21; 10:27-37; 20:25; John 15:12; 17:15; Romans 12-14; 1 Corinthians 5:9- 10; 6:1-7; 7:20-24; 10:23-11:1; Galatians 3:26-28; Ephesians 6:5-9; Colossians 3:12- 17; 1 Thessalonians 3:12; Philemon; James 1:27; 2:8."],
  },
  {
    number: 17,
    title: "Peace and War",
    paragraphs: ["It is the duty of Christians to seek peace with all men on principles of righteousness. In accordance with the spirit and teachings of Christ, they should do all in their power to put an end to war.", "The true remedy for the war spirit is the gospel of our Lord. The supreme need of the world is the acceptance of His teachings in all the affairs of men and nations, and the practical application of His law of love. Christian people throughout the world should pray for the reign of the Prince of Peace."],
    subsections: [
    ],
    scriptures: ["Isaiah 2:4; Matthew 5:9, 38-48; 6:33; 26:52; Luke 22:36, 38; Romans 12:18-19; 13:1-7; 14:19; Hebrews 12:14; James 4:1-2."],
  },
  {
    number: 18,
    title: "Religious Liberty",
    paragraphs: ["God alone is Lord of the conscience, and He has left it free from the doctrines and commandments of men which are contrary to His Word or not contained in it. Church and state should be separate. The state owes to every church protection and full freedom in the pursuit of its spiritual ends. In providing for such freedom no ecclesiastical group or denomination should be favoured by the state more than others. Civil government being ordained of God, it is the duty of Christians to render loyal obedience thereto in all things not contrary to the revealed will of God. The church should not resort to the civil power to carry on its work. The gospel of Christ contemplates spiritual means alone for the pursuit of its ends. The state has no right to impose penalties for religious opinions of any kind. The state has no right to impose taxes for the support of any form of religion. A free church in a free state is the Christian ideal, and this implies the right of free and unhindered access to God on the part of all men, and the right to form and propagate opinions in the sphere of religion without interference by the civil power."],
    subsections: [
    ],
    scriptures: ["Genesis 1:27; 2:7; Matthew 6:6-7, 24; 16:26; 22:21; John 8:36; Acts 4:19-20; Romans 6:1-2; 13:1-7; Galatians 5:1, 13; Philippians 3:20; 1 Timothy 2:1-2; James 4:12; 1 Peter 2:12-17; 3:11-17; 4:12-19."],
  },
  {
    number: 19,
    title: "The Family",
    paragraphs: ["God has ordained the family as the foundational institution of human society. It is composed of persons related to one another by marriage, blood or adoption.", "Marriage is the uniting of one man and one woman in covenant commitment for a lifetime. It is God’s unique gift to reveal the union between Christ and His church and to provide for the man and the woman in marriage the framework for intimate companionship, the channel of sexual expression according to biblical standards, and the means for procreation of the human race.", "The husband and wife are of equal worth before God since both are created in God’s image. The marriage relationship models the way God relates to His people. A husband is to love his wife as Christ loved the church. He has the God-given responsibility to provide for, to protect, and to lead his family. A wife is to submit herself graciously to the servant leadership of her husband even as the church willingly submits to the headship of Christ. She, being in the image of God as is her husband and thus equal to him, has the God-given responsibility to respect her husband and to serve as his helper in managing the household and nurturing the next generation.", "Children, from the moment of conception, are a blessing and heritage from the Lord. Parents are to demonstrate to their children God’s pattern for marriage. Parents are to teach their children spiritual and moral values and to lead them, through consistent lifestyle example and loving discipline, to make choices based on biblical truth. Children are to honour and obey their parents."],
    subsections: [
    ],
    scriptures: [],
  },
  {
    number: 20,
    title: "The Human Sexuality, Marriage, Gender Identity, And Christian Love",
    paragraphs: [],
    subsections: [
      {
        label: "",
        title: "Of Human Sexuality",
        paragraphs: ["We believe that God created human sexuality to be an expression of love and unity between a biological man and a biological woman within the covenant of marriage. (Genesis 2:18-25, Matthew 19:3-6, I Corinthians 7:2-4, Ephesians 5:22-33) We believe that any heterosexual sexual activity outside the bond of marriage (including fornication and adultery), any homosexual sexual activity, and any other form of sexual immorality (including bisexual conduct, bestiality, incest, and use of pornography) is an abomination to the Lord (Leviticus 18:19-23), is an indication of sin's decaying effects, deserving of God's righteous judgment (Romans 1:26-32), excludes one from inclusion in the kingdom of God if continually practiced, and can be conquered through Christ's sacrifice on the cross resulting in lasting change (I Corinthians 6:9-11)."],
        scriptures: [],
      },
      {
        label: "",
        title: "Of Marriage",
        paragraphs: ["We believe that the term “marriage” has only one meaning: the uniting of one biological man and one biological woman in a single, exclusive, permanent, covenantal union, that displays God's redemptive work for His Church. (Genesis 2:18-25, Matthew 19:3-6; Ephesians 5:22-33) We believe that scripture condemns all homosexual activity and that marriage, by God's design, can only be entered into by a heterosexual couple."],
        scriptures: [],
      },
      {
        label: "",
        title: "Of Gender Identity",
        paragraphs: ["We believe that God wonderfully and immutably creates each person as male or female. These two distinct, complementary genders together reflect the image of God. (Genesis 1:26-27). Rejection of one’s biological gender is a rejection of the purpose of God for that person's gender and a repudiation and denial of the glory of God in His creation of that person. (Psalm 139:13-16)"],
        scriptures: [],
      },
      {
        label: "",
        title: "Of Christian Love",
        paragraphs: ["We believe that every person must be afforded compassion, love, kindness, respect, and dignity for the sake of the gospel. (Mark 12:28-31; Luke 6:31.) We believe that the most loving thing one can do is share the truth of what the Bible says about sinful behavior and the hope that the gospel brings (Romans 6:15-23). Hateful and harassing behavior or attitudes directed toward any individual are to be repudiated and are not in accord with Scripture, the message of the gospel, nor the doctrines of Ashburton Baptist Church."],
        scriptures: ["Genesis 1:26-28; 2:15-25; 3:1-20; Exodus 20:12; Deuteronomy 6:4-9; Joshua 24:15; 1 Samuel 1:26 28; Psalms 51:5; 78:1-8; 127; 128; 139:13-16; Proverbs 1:8; 5:15-20; 6:20-22; 12:4; 13:24; 14:1; 17:6; 18:22; 22:6, 15; 23:13-14; 24:3; 29:15,17; 31:10-31; Ecclesiastes 4:9-12; 9:9; Malachi 2:14-16; Matthew 5:31-32; 18:2-5; 19:3-9; Mark 10:6- 12; Romans 1:18-32; 1 Corinthians 7:1-16; Ephesians 5:21-33; 6:1-4; Colossians 3:18- 21; 1 Timothy 5:8,14; 2 Timothy 1:3-5; Titus 2:3-5; Hebrews 13:4; 1 Peter 3:1-7."],
      },
    ],
    scriptures: [],
  },
];
