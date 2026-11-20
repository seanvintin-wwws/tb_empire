// Unit list for the roster check: base_id|name|alignment (L/D/N)|category codes (one character each, see ROTE_CATS).
// Ships: base_id|name|alignment|c for capital ships. Taken from swgoh.gg /api/characters/ and /api/ships/ (Nov 2026),
// because swgoh.gg doesn't let other sites read those lists directly. Add new units here when they come out.
window.ROTE_CATS = ['501st','Bad Batch','Bounty Hunter','Clone Trooper','Constable','Droid','Empire','First Order','Galactic Legend','Galactic Republic','Geonosian','Gungan','Hutt Cartel','Imperial Remnant','Imperial Trooper','Inquisitorius','Jedi','Jedi Vanguard','Mandalorian','Mercenary','Nightsister','Old Republic','Phoenix','Pirate','Rebel','Rebel Fighter','Resistance','Scoundrel','Separatist','Sith','Sith Empire','Smuggler','Spectre','Unaligned Force User','Wookiee','Rogue One'];
window.ROTE_UNITS = `#C
4LOM|4-LOM|D|25r
50RT|50R-T|L|5l
AAYLASECURA|Aayla Secura|L|9gh
ADELPHIRANGER|Adelphi Ranger|L|o
ADMINISTRATORLANDO|Lando Calrissian|L|opr
ADMIRALACKBAR|Admiral Ackbar|L|o
ADMIRALPIETT|Admiral Piett|D|6e
ADMIRALRADDUS|Admiral Raddus|L|oz
AHSOKATANO|Ahsoka Tano (Snips)|L|09g
AMILYNHOLDO|Amilyn Holdo|L|q
ANAKINKNIGHT|Jedi Knight Anakin|L|9g
APPO|CC-1119 "Appo"|D|36
ARCTROOPER501ST|ARC Trooper|L|039
ARMORER|The Armorer|L|i
ASAJJDARKDISCIPLE|Asajj Ventress (Dark Disciple)|D|2kx
ASAJVENTRESS|Asajj Ventress|D|ksx
AURRA_SING|Aurra Sing|D|2jr
B1BATTLEDROIDV2|B1 Battle Droid|D|5s
B1MERCDROID|Mercenary Guard Droid (B1)|D|jc5
B2SUPERBATTLEDROID|B2 Super Battle Droid|D|5s
BADBATCHECHO|Echo|L|139
BADBATCHHUNTER|Hunter|L|139
BADBATCHOMEGA|Omega|L|13
BADBATCHTECH|Tech|L|139
BADBATCHWRECKER|Wrecker|L|139
BAILORGANA|Bail Organa|L|o
BARRISSOFFEE|Barriss Offee|L|9gh
BASTILASHAN|Bastila Shan|L|gl
BASTILASHANDARK|Bastila Shan (Fallen)|D|tu
BATCHERS3|Batcher|L|1
BAYLANSKOLL|Baylan Skoll|D|jx
BAZEMALBUS|Baze Malbus|L|opz
BB8|BB-8|L|5q
BENSOLO|Ben Solo|L|x
BIGGSDARKLIGHTER|Biggs Darklighter|L|op
BISHOP|Colonel Ward|L|
BISTAN|Bistan|L|opz
BOBAFETT|Boba Fett|D|2cr
BOBAFETTSCION|Boba Fett, Scion of Jango|D|2jr
BODHIROOK|Bodhi Rook|L|opz
BOKATAN|Bo-Katan Kryze|L|ir
BOOMADIER|Gungan Boomadier|L|b
BOSSK|Bossk|D|2r
BOSSNASS|Boss Nass|L|b
BOUSHH|Boushh (Leia Organa)|L|2cr
BRUTUS|Brutus|D|nr
BT1|BT-1|D|5r
C3POCHEWBACCA|Threepio & Chewie|L|5oy
C3POLEGENDARY|C-3PO|L|59oq
CADBANE|Cad Bane|D|2cjr
CALKESTIS|Cal Kestis|L|x
CANDEROUSORDO|Canderous Ordo|D|ijlr
CAPTAINDROGAN|Captain Drogan|L|op
CAPTAINENOCH|Captain Enoch|D|d
CAPTAINREX|Captain Rex|L|3mop
CAPTAINSILVO|Captain Silvo|D|nrx
CAPTAINTARPALS|Captain Tarpals|L|b
CARADUNE|Cara Dune|L|4jopr
CARSONTEVA|Captain Carson Teva|L|4o
CARTHONASI|Carth Onasi|L|l
CASSIANANDOR|Cassian Andor|L|opz
CASSIANUNDERCOVER|Cassian Andor (Undercover)|L|op
CC2224|CC-2224 "Cody"|L|39
CEREJUNDA|Cere Junda|L|rx
CHEWBACCALEGENDARY|Chewbacca|L|orvy
CHIEFCHIRPA|Chief Chirpa|L|
CHIEFNEBIT|Chief Nebit|L|
CHIRRUTIMWE|Chirrut Îmwe|L|opz
CHOPPERS3|Chopper|L|5mow
CINTA|Cinta Kaz|L|op
CLONESERGEANTPHASEI|Clone Sergeant - Phase I|L|39
CLONEWARSCHEWBACCA|Clone Wars Chewbacca|L|9ry
COBBVANTH|Cobb Vanth|L|4
COLONELSTARCK|Colonel Starck|D|6e
COMMANDERAHSOKA|Commander Ahsoka Tano|L|9rx
COMMANDERLUKESKYWALKER|Commander Luke Skywalker|L|ox
CORUSCANTUNDERWORLDPOLICE|Coruscant Underworld Police|L|49
COUNTDOOKU|Count Dooku|D|st
CROSSHAIRS3|Crosshair (Scarred)|L|1
CT210408|CT-21-0408 "Echo"|L|039
CT5555|CT-5555 "Fives"|L|039
CT7567|CT-7567 "Rex"|L|039
DAKA|Old Daka|D|k
DARKREY|Rey (Dark Side Vision)|D|7t
DARKTROOPER|Dark Trooper|D|56de
DARTHBANE|Darth Bane|D|t
DARTHJARJAR|Darth Jar Jar|D|bt
DARTHMALAK|Darth Malak|D|tu
DARTHMALGUS|Darth Malgus|D|tu
DARTHNIHILUS|Darth Nihilus|D|t
DARTHREVAN|Darth Revan|D|tu
DARTHSIDIOUS|Darth Sidious|D|t
DARTHSION|Darth Sion|D|t
DARTHTALON|Darth Talon|D|t
DARTHTRAYA|Darth Traya|D|t
DASHRENDAR|Dash Rendar|L|jrv
DATHCHA|Dathcha|L|
DEATHTROOPER|Death Trooper|D|6de
DEATHTROOPERPERIDEA|Death Trooper (Peridea)|D|dk
DEDRAMEERO|Dedra Meero|D|6
DENGAR|Dengar|D|2jr
DEPABILLABA|Depa Billaba|L|9gh
DIRECTORKRENNIC|Director Krennic|D|6
DISGUISEDCLONETROOPER|Disguised Clone Trooper|D|36
DOCTORAPHRA|Doctor Aphra|D|jr
DROIDEKA|Droideka|D|5s
EDRIOTWOTUBES|Edrio Two Tubes|L|jop
EETHKOTH|Eeth Koth|L|9gh
EIGHTHBROTHER|Eighth Brother|D|6fx
EMBO|Embo|D|2cjr
EMBOANDKEIBU|Embo & Keibu|D|2cjr
EMPERORPALPATINE|Emperor Palpatine|D|6t
ENFYSNEST|Enfys Nest|L|nrv
EPIXFINN|Resistance Hero Finn|L|q
EPIXPOE|Resistance Hero Poe|L|q
EWOKELDER|Ewok Elder|L|
EWOKSCOUT|Ewok Scout|L|
EZRABRIDGERS3|Ezra Bridger|L|gmo
EZRAEXILE|Ezra Bridger (Exile)|L|gw
FENNECSHAND|Fennec Shand|D|2jr
FIFTHBROTHER|Fifth Brother|D|6fx
FINN|Finn|L|q
FIRSTORDEREXECUTIONER|First Order Executioner|D|7
FIRSTORDEROFFICERMALE|First Order Officer|D|7
FIRSTORDERSPECIALFORCESPILOT|First Order SF TIE Pilot|D|7
FIRSTORDERTIEPILOT|First Order TIE Pilot|D|7
FIRSTORDERTROOPER|First Order Stormtrooper|D|7
FOSITHTROOPER|Sith Trooper|D|7t
FULCRUMAHSOKA|Ahsoka Tano (Fulcrum)|L|owx
GAMORREANGUARD|Gamorrean Guard|D|cr
GARSAXON|Gar Saxon|D|6i
GENERALDRAVEN|General Draven|L|op
GENERALHUX|General Hux|D|7
GENERALKENOBI|General Kenobi|L|9g
GENERALMERRICK|General Merrick|L|op
GENERALSKYWALKER|General Skywalker|L|09g
GENERALSYNDULLA|General Syndulla|L|w
GEONOSIANBROODALPHA|Geonosian Brood Alpha|D|as
GEONOSIANSOLDIER|Geonosian Soldier|D|as
GEONOSIANSPY|Geonosian Spy|D|as
GLAHSOKATANO|Ahsoka Tano|L|8wx
GLHONDO|Pirate King Hondo Ohnaka|D|8nrv
GLLEIA|Leia Organa|L|8o
GLMANDOGROGU|The Mandalorian and Grogu|L|82irx
GLREY|Rey|L|q8x
GOPHERANTS|Grogu & Anzellans|L|ix
GRANDADMIRALTHRAWN|Grand Admiral Thrawn|D|6
GRANDINQUISITOR|Grand Inquisitor|D|6fx
GRANDMASTERLUKE|Jedi Master Luke Skywalker|L|8g
GRANDMASTERYODA|Grand Master Yoda|L|9g
GRANDMOFFTARKIN|Grand Moff Tarkin|D|6
GREATMOTHERS|Great Mothers|D|k
GREEDO|Greedo|D|2cr
GREEFKARGA|Greef Karga|L|2r
GRIEVOUS|General Grievous|D|5s
GUNGANPHALANX|Gungan Phalanx|L|b
HANSOLO|Han Solo|L|jorv
HERASYNDULLAS3|Hera Syndulla|L|mo
HERMITYODA|Hermit Yoda|L|g
HK47|HK-47|D|5u
HONDO|Hondo Ohnaka|N|jnrv
HOTHHAN|Captain Han Solo|L|or
HOTHLEIA|Rebel Officer Leia Organa|L|o
HOTHREBELSCOUT|Hoth Rebel Scout|L|op
HOTHREBELSOLDIER|Hoth Rebel Soldier|L|op
HUMANTHUG|Mob Enforcer|D|cr
HUNTERS3|Hunter (Mercenary)|L|1j
HUYANG|Huyang|L|5w
IDENVERSIOEMPIRE|Iden Versio|D|6e
IG11|IG-11|L|5r
IG12|IG-12 & Grogu|L|i
IG86SENTINELDROID|IG-86 Sentinel Droid|D|5
IG88|IG-88|D|25r
IG90|IG-90|D|25r
IMAGUNDI|Ima-Gun Di|L|9gh
IMPERIALPROBEDROID|Imperial Probe Droid|D|56
IMPERIALSUPERCOMMANDO|Imperial Super Commando|D|6i
INQUISITORBARRISS|Inquisitor Barriss|D|6fx
ITHANO|Captain Ithano|D|nr
JABBATHEHUTT|Jabba the Hutt|D|82cv
JANGOFETT|Jango Fett|D|2ijrs
JARJARBINKS|Jar Jar Binks|L|b
JAWA|Jawa|L|
JAWAENGINEER|Jawa Engineer|L|
JAWASCAVENGER|Jawa Scavenger|L|
JAXXON|Jaxxon|L|jrv
JEDIKNIGHTCAL|Jedi Knight Cal Kestis|L|gj
JEDIKNIGHTCONSULAR|Jedi Consular|L|9gh
JEDIKNIGHTGUARDIAN|Jedi Knight Guardian|L|9gh
JEDIKNIGHTLUKE|Jedi Knight Luke Skywalker|L|g
JEDIKNIGHTREVAN|Jedi Knight Revan|L|gl
JEDIMASTERKENOBI|Jedi Master Kenobi|L|89g
JEDIMASTERMACEWINDU|Jedi Master Mace Windu|L|9gh
JOCASTANU|Jocasta Nu|L|9gh
JOLEEBINDO|Jolee Bindo|L|gl
JUHANI|Juhani|L|gl
JYNERSO|Jyn Erso|L|opz
JYNERSOUNDERCOVER|Jyn Erso (Undercover)|L|opz
K2SO|K-2SO|L|5opz
KANANJARRUSS3|Kanan Jarrus|L|gmo
KELLERANBEQ|Kelleran Beq|L|9gh
KIADIMUNDI|Ki-Adi-Mundi|L|9g
KITFISTO|Kit Fisto|L|9gh
KIX|Kix|L|3nr
KLEYA|Kleya Marki|L|op
KRRSANTAN|Krrsantan|D|2cjry
KUIIL|Kuiil|L|r
KXSECURITYDROID|KX Security Droid|D|56
KYLEKATARN|Kyle Katarn|L|gjop
KYLOREN|Kylo Ren|D|7x
KYLORENUNMASKED|Kylo Ren (Unmasked)|D|7x
L3_37|L3-37|L|5jrv
LEIAJEDITRAINING|Leia (Jedi Training)|L|g
LOBOT|Lobot|L|4o
LOGRAY|Logray|L|
LORDVADER|Lord Vader|D|86t
LUKESKYWALKER|Luke Skywalker (Farmboy)|L|o
LUKESTARKILLER|Starkiller (Luke Concept)|L|ox
LUMINARAUNDULI|Luminara Unduli|L|9gh
LUTHENRAEL|Luthen Rael|L|op
MACEWINDU|Mace Windu|L|9g
MAGMATROOPER|Magmatrooper|D|6e
MAGNAGUARD|IG-100 MagnaGuard|D|5s
MAJORPARTAGAZ|Major Partagaz|D|6
MANDALORBOKATAN|Bo-Katan (Mand'alor)|L|i
MARAJADE|Mara Jade, The Emperor's Hand|D|6x
MARAJADESKYWALKER|Mara Jade Skywalker|L|g
MARROK|Marrok|D|fjx
MASTERQUIGON|Master Qui-Gon|L|9g
MAUL|Darth Maul|D|t
MAULHATEFUELED|Maul (Hate-Fueled)|D|x
MAULS7|Maul|D|ix
MAZKANATA|Maz Kanata|L|nrvx
MERRIN|Merrin|D|k
MISSIONVAO|Mission Vao|L|jlr
MOFFGIDEONS1|Moff Gideon|D|6de
MOFFGIDEONS3|Dark Trooper Moff Gideon|D|6d
MONMOTHMA|Mon Mothma|L|o
MORGANELSBETH|Morgan Elsbeth|D|k
MOROFF|Moroff|L|jop
MOTHERTALZIN|Mother Talzin|D|k
NIGHTSISTERACOLYTE|Nightsister Acolyte|D|k
NIGHTSISTERINITIATE|Nightsister Initiate|D|k
NIGHTSISTERSPIRIT|Nightsister Spirit|D|k
NIGHTSISTERZOMBIE|Nightsister Zombie|D|k
NIGHTTROOPER|Night Trooper|D|dk
NINTHSISTER|Ninth Sister|D|6fx
NUTEGUNRAY|Nute Gunray|D|rs
OLDBENKENOBI|Obi-Wan Kenobi (Old Ben)|L|go
OMEGAS3|Omega (Fugitive)|L|1
OPERATIVE|CX-2|D|36
PADAWANOBIWAN|Padawan Obi-Wan|L|9g
PADAWANSABINE|Padawan Sabine Wren|L|iwx
PADMEAMIDALA|Padmé Amidala|L|9
PAO|Pao|L|opz
PAPLOO|Paploo|L|
PAZVIZSLA|Paz Vizsla|L|i
PHASMA|Captain Phasma|D|7
PLOKOON|Plo Koon|L|9gh
POE|Poe Dameron|L|q
POGGLETHELESSER|Poggle the Lesser|D|as
PRINCESSKNEESAA|Princess Kneesaa|L|
PRINCESSLEIA|Princess Leia|L|o
QIRA|Qi'ra|L|jrv
QUEENAMIDALA|Queen Amidala|L|9
QUIGGOLD|Quiggold|D|nr
QUIGONJINN|Qui-Gon Jinn|L|9gh
R2D2_LEGENDARY|R2-D2|L|59oq
R5D4|R5-D4|L|5op
RACCOON|Rotta the Hutt|L|c
RANGERZEB|Zeb Orrelios (New Republic Pilot)|L|
RANGETROOPER|Range Trooper|D|6e
REMNANTSNOWCOMMANDER|Snowtrooper Commander|D|6de
RESISTANCEPILOT|Resistance Pilot|L|q
RESISTANCETROOPER|Resistance Trooper|L|q
REY|Rey (Scavenger)|L|qx
REYJEDITRAINING|Rey (Jedi Training)|L|qx
ROSETICO|Rose Tico|L|q
ROYALGUARD|Royal Guard|D|6
SABINEWRENS3|Sabine Wren|L|imo
SANASTARROS|Sana Starros|L|jnrv
SATELESHAN|Satele Shan|L|gl
SAVAGEOPRESS|Savage Opress|D|t
SAWGERRERA|Saw Gerrera|L|op
SCARIFREBEL|Scarif Rebel Pathfinder|L|opz
SCORCH|RC-1262 "Scorch"|D|36
SCOUTTROOPER_V3|Scout Trooper|D|6de
SECONDSISTER|Second Sister|D|6fx
SERGEANTMELSHI|Sergeant Melshi|L|opz
SEVENTHSISTER|Seventh Sister|D|6fx
SHAAKTI|Shaak Ti|L|9gh
SHINHATI|Shin Hati|D|jx
SHORETROOPER|Shoretrooper|D|6e
SITHASSASSIN|Sith Assassin|D|tu
SITHMARAUDER|Sith Marauder|D|tu
SITHPALPATINE|Sith Eternal Emperor|D|8t
SITHTROOPER|Sith Empire Trooper|D|tu
SM33|SM-33|D|5nr
SMUGGLERCHEWBACCA|Veteran Smuggler Chewbacca|L|qryv
SMUGGLERHAN|Veteran Smuggler Han Solo|L|jqrv
SNOWTROOPER|Snowtrooper|D|6ed
STAP|STAP|D|5s
STARKILLER|Starkiller|D|x
STORMTROOPER|Stormtrooper|D|6de
STORMTROOPERCONCEPT|Stormtrooper (Concept)|D|6e
STORMTROOPERHAN|Stormtrooper Han|L|or
STORMTROOPERLUKE|Stormtrooper Luke|L|o
STRANGER|The Stranger|D|t
SUNFAC|Sun Fac|D|as
SUPREMELEADERKYLOREN|Supreme Leader Kylo Ren|D|78x
T3_M4|T3-M4|L|5l
TALIA|Talia|D|k
TARFFUL|Tarfful|L|y
TARONMALICOS|Taron Malicos|D|x
TEEBO|Teebo|L|
THEMANDALORIAN|The Mandalorian|L|2ir
THEMANDALORIANBESKARARMOR|The Mandalorian (Beskar Armor)|L|ijr
THERONIN|The Ronin|D|t
THIRDSISTER|Third Sister|D|6fx
TIEFIGHTERPILOT|TIE Fighter Pilot|D|6d
TRENCH|Admiral Trench|D|s
TRIPLEZERO|0-0-0|D|5r
TUSKENCHIEFTAIN|Tusken Chieftain|D|
TUSKENHUNTRESS|Tusken Warrior|D|
TUSKENRAIDER|Tusken Raider|D|
TUSKENSHAMAN|Tusken Shaman|D|
UGNAUGHT|Ugnaught|L|
UNDERCOVERLANDO|Skiff Guard (Lando Calrissian)|L|crv
URORRURRR|URoRRuR'R'R|D|
VADER|Darth Vader|D|6t
VADERDUELSEND|Darth Vader (Duel's End)|D|6t
VANE|Vane|D|nr
VANGUARDTEMPLEGUARD|Temple Guard|L|9gh
VEERS|General Veers|D|6e
VEL|Vel Sartha|L|op
VISASMARR|Visas Marr|L|x
WAMPA|Wampa|D|
WATTAMBOR|Wat Tambor|D|s
WEDGEANTILLES|Wedge Antilles|L|op
WICKET|Wicket|L|
WRECKERS3|Wrecker (Mercenary)|L|1j
YODACHEWBACCA|Yoda & Chewie|L|9gy
YODADSV|Yoda (Dark Side Vision)|D|t
YOUNGCHEWBACCA|Vandor Chewbacca|L|jrvy
YOUNGHAN|Young Han Solo|L|jrv
YOUNGLANDO|Young Lando Calrissian|L|jrv
ZAALBAR|Zaalbar|L|jlry
ZAMWESELL|Zam Wesell|D|2jr
ZEBS3|Garazeb "Zeb" Orrelios|L|om
ZORIIBLISS_V2|Zorii Bliss|L|qrv
ZUCKUSS|Zuckuss|D|2rx
#S
ARC170CLONESERGEANT|Clone Sergeant's ARC-170|L|
ARC170REX|Rex's ARC-170|L|
BLADEOFDORIN|Plo Koon's Jedi Starfighter|L|
BWINGREBEL|Rebel B-wing|L|
CAPITALCHIMAERA|Chimaera|D|c
CAPITALEXECUTOR|Executor|D|c
CAPITALFINALIZER|Finalizer|D|c
CAPITALJEDICRUISER|Endurance|L|c
CAPITALLEVIATHAN|Leviathan|D|c
CAPITALMALEVOLENCE|Malevolence|D|c
CAPITALMONCALAMARICRUISER|Home One|L|c
CAPITALNEGOTIATOR|Negotiator|L|c
CAPITALPROFUNDITY|Profundity|L|c
CAPITALRADDUS|Raddus|L|c
CAPITALSTARDESTROYER|Executrix|D|c
COMEUPPANCE|Comeuppance|L|
COMMANDSHUTTLE|Kylo Ren's Command Shuttle|D|
EBONHAWK|Ebon Hawk|L|
EMPERORSSHUTTLE|Emperor's Shuttle|D|
FIRSTORDERTIEECHELON|TIE Echelon|D|
FURYCLASSINTERCEPTOR|Fury-class Interceptor|D|
GAUNTLETSTARFIGHTER|Gauntlet Starfighter|D|
GEONOSIANSTARFIGHTER1|Sun Fac's Geonosian Starfighter|D|
GEONOSIANSTARFIGHTER2|Geonosian Soldier's Starfighter|D|
GEONOSIANSTARFIGHTER3|Geonosian Spy's Starfighter|D|
GHOST|Ghost|L|
HOUNDSTOOTH|Hound's Tooth|D|
HYENABOMBER|Hyena Bomber|D|
IG2000|IG-2000|D|
JEDISTARFIGHTERAHSOKATANO|Ahsoka Tano's Jedi Starfighter|L|
JEDISTARFIGHTERANAKIN|Anakin's Eta-2 Starfighter|L|
JEDISTARFIGHTERCONSULAR|Jedi Consular's Starfighter|L|
MARAUDER|Marauder|L|
MG100STARFORTRESSSF17|MG-100 StarFortress SF-17|L|
MILLENNIUMFALCON|Han's Millennium Falcon|L|
MILLENNIUMFALCONEP7|Rey's Millennium Falcon|L|
MILLENNIUMFALCONPRISTINE|Lando's Millennium Falcon|L|
OUTRIDER|Outrider|L|
PHANTOM2|Phantom II|L|
PUNISHINGONE|Punishing One|D|
RAVENSCLAW|Raven's Claw|L|
RAZORCREST|Razor Crest|L|
ROGUEONESHIP|Rogue One|L|
SCYTHE|Scythe|D|
SITHBOMBER|B-28 Extinction-class Bomber|D|
SITHFIGHTER|Sith Fighter|D|
SITHINFILTRATOR|Scimitar|D|
SITHSUPREMACYCLASS|Mark VI Interceptor|D|
SLAVE1|Slave I|D|
TIEADVANCED|TIE Advanced x1|D|
TIEBOMBERIMPERIAL|Imperial TIE Bomber|D|
TIEDAGGER|TIE Dagger|D|
TIEDEFENDER|TIE Defender|D|
TIEFIGHTERFIRSTORDER|First Order TIE Fighter|D|
TIEFIGHTERFOSF|First Order SF TIE Fighter|D|
TIEFIGHTERIMPERIAL|Imperial TIE Fighter|D|
TIEINTERCEPTOR|TIE/IN Interceptor Prototype|D|
TIEREAPER|TIE Reaper|D|
TIESILENCER|TIE Silencer|D|
UMBARANSTARFIGHTER|Umbaran Starfighter|L|
UWINGROGUEONE|Cassian's U-wing|L|
UWINGSCARIF|Bistan's U-wing|L|
VULTUREDROID|Vulture Droid|D|
XANADUBLOOD|Xanadu Blood|D|
XWINGBLACKONE|Poe Dameron's X-wing|L|
XWINGRED2|Wedge Antilles's X-wing|L|
XWINGRED3|Biggs Darklighter's X-wing|L|
XWINGRESISTANCE|Resistance X-wing|L|
YWINGCLONEWARS|BTL-B Y-wing Starfighter|L|
YWINGREBEL|Rebel Y-wing|L|`;
