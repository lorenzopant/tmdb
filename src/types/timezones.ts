export type Timezone = TimezoneTuple[number];
type TimezoneTuple = (typeof TIMEZONE_DATA)[number]["zones"];

// No need to export this variable, only used for internal type generation from .json values
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TIMEZONE_DATA = [
	{
		iso_3166_1: "AD",
		zones: ["Europe/Andorra"] as const,
	},
	{
		iso_3166_1: "AE",
		zones: ["Asia/Dubai"] as const,
	},
	{
		iso_3166_1: "AF",
		zones: ["Asia/Kabul"] as const,
	},
	{
		iso_3166_1: "AG",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "AI",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "AL",
		zones: ["Europe/Tirane"] as const,
	},
	{
		iso_3166_1: "AM",
		zones: ["Asia/Yerevan"] as const,
	},
	{
		iso_3166_1: "AO",
		zones: ["Africa/Lagos"] as const,
	},
	{
		iso_3166_1: "AQ",
		zones: [
			"Antarctica/Casey",
			"Antarctica/Davis",
			"Antarctica/Mawson",
			"Antarctica/Palmer",
			"Antarctica/Rothera",
			"Antarctica/Troll",
			"Asia/Urumqi",
			"Pacific/Auckland",
			"Pacific/Port_Moresby",
			"Asia/Riyadh",
		] as const,
	},
	{
		iso_3166_1: "AR",
		zones: [
			"America/Argentina/Buenos_Aires",
			"America/Argentina/Cordoba",
			"America/Argentina/Salta",
			"America/Argentina/Jujuy",
			"America/Argentina/Tucuman",
			"America/Argentina/Catamarca",
			"America/Argentina/La_Rioja",
			"America/Argentina/San_Juan",
			"America/Argentina/Mendoza",
			"America/Argentina/San_Luis",
			"America/Argentina/Rio_Gallegos",
			"America/Argentina/Ushuaia",
		] as const,
	},
	{
		iso_3166_1: "AS",
		zones: ["Pacific/Pago_Pago"] as const,
	},
	{
		iso_3166_1: "AT",
		zones: ["Europe/Vienna"] as const,
	},
	{
		iso_3166_1: "AU",
		zones: [
			"Australia/Lord_Howe",
			"Antarctica/Macquarie",
			"Australia/Hobart",
			"Australia/Melbourne",
			"Australia/Sydney",
			"Australia/Broken_Hill",
			"Australia/Brisbane",
			"Australia/Lindeman",
			"Australia/Adelaide",
			"Australia/Darwin",
			"Australia/Perth",
			"Australia/Eucla",
		] as const,
	},
	{
		iso_3166_1: "AW",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "AX",
		zones: ["Europe/Helsinki"] as const,
	},
	{
		iso_3166_1: "AZ",
		zones: ["Asia/Baku"] as const,
	},
	{
		iso_3166_1: "BA",
		zones: ["Europe/Belgrade"] as const,
	},
	{
		iso_3166_1: "BB",
		zones: ["America/Barbados"] as const,
	},
	{
		iso_3166_1: "BD",
		zones: ["Asia/Dhaka"] as const,
	},
	{
		iso_3166_1: "BE",
		zones: ["Europe/Brussels"] as const,
	},
	{
		iso_3166_1: "BF",
		zones: ["Africa/Abidjan"] as const,
	},
	{
		iso_3166_1: "BG",
		zones: ["Europe/Sofia"] as const,
	},
	{
		iso_3166_1: "BH",
		zones: ["Asia/Qatar"] as const,
	},
	{
		iso_3166_1: "BI",
		zones: ["Africa/Maputo"] as const,
	},
	{
		iso_3166_1: "BJ",
		zones: ["Africa/Lagos"] as const,
	},
	{
		iso_3166_1: "BL",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "BM",
		zones: ["Atlantic/Bermuda"] as const,
	},
	{
		iso_3166_1: "BN",
		zones: ["Asia/Kuching"] as const,
	},
	{
		iso_3166_1: "BO",
		zones: ["America/La_Paz"] as const,
	},
	{
		iso_3166_1: "BQ",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "BR",
		zones: [
			"America/Noronha",
			"America/Belem",
			"America/Fortaleza",
			"America/Recife",
			"America/Araguaina",
			"America/Maceio",
			"America/Bahia",
			"America/Sao_Paulo",
			"America/Campo_Grande",
			"America/Cuiaba",
			"America/Santarem",
			"America/Porto_Velho",
			"America/Boa_Vista",
			"America/Manaus",
			"America/Eirunepe",
			"America/Rio_Branco",
		] as const,
	},
	{
		iso_3166_1: "BS",
		zones: ["America/Toronto"] as const,
	},
	{
		iso_3166_1: "BT",
		zones: ["Asia/Thimphu"] as const,
	},
	{
		iso_3166_1: "BV",
		zones: [] as const,
	},
	{
		iso_3166_1: "BW",
		zones: ["Africa/Maputo"] as const,
	},
	{
		iso_3166_1: "BY",
		zones: ["Europe/Minsk"] as const,
	},
	{
		iso_3166_1: "BZ",
		zones: ["America/Belize"] as const,
	},
	{
		iso_3166_1: "CA",
		zones: [
			"America/St_Johns",
			"America/Halifax",
			"America/Glace_Bay",
			"America/Moncton",
			"America/Goose_Bay",
			"America/Toronto",
			"America/Iqaluit",
			"America/Winnipeg",
			"America/Resolute",
			"America/Rankin_Inlet",
			"America/Regina",
			"America/Swift_Current",
			"America/Edmonton",
			"America/Cambridge_Bay",
			"America/Inuvik",
			"America/Dawson_Creek",
			"America/Fort_Nelson",
			"America/Whitehorse",
			"America/Dawson",
			"America/Vancouver",
			"America/Panama",
			"America/Puerto_Rico",
			"America/Phoenix",
		] as const,
	},
	{
		iso_3166_1: "CC",
		zones: ["Asia/Yangon"] as const,
	},
	{
		iso_3166_1: "CD",
		zones: ["Africa/Maputo", "Africa/Lagos"] as const,
	},
	{
		iso_3166_1: "CF",
		zones: ["Africa/Lagos"] as const,
	},
	{
		iso_3166_1: "CG",
		zones: ["Africa/Lagos"] as const,
	},
	{
		iso_3166_1: "CH",
		zones: ["Europe/Zurich"] as const,
	},
	{
		iso_3166_1: "CI",
		zones: ["Africa/Abidjan"] as const,
	},
	{
		iso_3166_1: "CK",
		zones: ["Pacific/Rarotonga"] as const,
	},
	{
		iso_3166_1: "CL",
		zones: ["America/Santiago", "America/Punta_Arenas", "Pacific/Easter"] as const,
	},
	{
		iso_3166_1: "CM",
		zones: ["Africa/Lagos"] as const,
	},
	{
		iso_3166_1: "CN",
		zones: ["Asia/Shanghai", "Asia/Urumqi"] as const,
	},
	{
		iso_3166_1: "CO",
		zones: ["America/Bogota"] as const,
	},
	{
		iso_3166_1: "CR",
		zones: ["America/Costa_Rica"] as const,
	},
	{
		iso_3166_1: "CU",
		zones: ["America/Havana"] as const,
	},
	{
		iso_3166_1: "CV",
		zones: ["Atlantic/Cape_Verde"] as const,
	},
	{
		iso_3166_1: "CW",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "CX",
		zones: ["Asia/Bangkok"] as const,
	},
	{
		iso_3166_1: "CY",
		zones: ["Asia/Nicosia", "Asia/Famagusta"] as const,
	},
	{
		iso_3166_1: "CZ",
		zones: ["Europe/Prague"] as const,
	},
	{
		iso_3166_1: "DE",
		zones: ["Europe/Berlin", "Europe/Zurich"] as const,
	},
	{
		iso_3166_1: "DJ",
		zones: ["Africa/Nairobi"] as const,
	},
	{
		iso_3166_1: "DK",
		zones: ["Europe/Berlin"] as const,
	},
	{
		iso_3166_1: "DM",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "DO",
		zones: ["America/Santo_Domingo"] as const,
	},
	{
		iso_3166_1: "DZ",
		zones: ["Africa/Algiers"] as const,
	},
	{
		iso_3166_1: "EC",
		zones: ["America/Guayaquil", "Pacific/Galapagos"] as const,
	},
	{
		iso_3166_1: "EE",
		zones: ["Europe/Tallinn"] as const,
	},
	{
		iso_3166_1: "EG",
		zones: ["Africa/Cairo"] as const,
	},
	{
		iso_3166_1: "EH",
		zones: ["Africa/El_Aaiun"] as const,
	},
	{
		iso_3166_1: "ER",
		zones: ["Africa/Nairobi"] as const,
	},
	{
		iso_3166_1: "ES",
		zones: ["Europe/Madrid", "Africa/Ceuta", "Atlantic/Canary"] as const,
	},
	{
		iso_3166_1: "ET",
		zones: ["Africa/Nairobi"] as const,
	},
	{
		iso_3166_1: "FI",
		zones: ["Europe/Helsinki"] as const,
	},
	{
		iso_3166_1: "FJ",
		zones: ["Pacific/Fiji"] as const,
	},
	{
		iso_3166_1: "FK",
		zones: ["Atlantic/Stanley"] as const,
	},
	{
		iso_3166_1: "FM",
		zones: ["Pacific/Kosrae", "Pacific/Port_Moresby", "Pacific/Guadalcanal"] as const,
	},
	{
		iso_3166_1: "FO",
		zones: ["Atlantic/Faroe"] as const,
	},
	{
		iso_3166_1: "FR",
		zones: ["Europe/Paris"] as const,
	},
	{
		iso_3166_1: "GA",
		zones: ["Africa/Lagos"] as const,
	},
	{
		iso_3166_1: "GB",
		zones: ["Europe/London"] as const,
	},
	{
		iso_3166_1: "GD",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "GE",
		zones: ["Asia/Tbilisi"] as const,
	},
	{
		iso_3166_1: "GF",
		zones: ["America/Cayenne"] as const,
	},
	{
		iso_3166_1: "GG",
		zones: ["Europe/London"] as const,
	},
	{
		iso_3166_1: "GH",
		zones: ["Africa/Abidjan"] as const,
	},
	{
		iso_3166_1: "GI",
		zones: ["Europe/Gibraltar"] as const,
	},
	{
		iso_3166_1: "GL",
		zones: ["America/Nuuk", "America/Danmarkshavn", "America/Scoresbysund", "America/Thule"] as const,
	},
	{
		iso_3166_1: "GM",
		zones: ["Africa/Abidjan"] as const,
	},
	{
		iso_3166_1: "GN",
		zones: ["Africa/Abidjan"] as const,
	},
	{
		iso_3166_1: "GP",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "GQ",
		zones: ["Africa/Lagos"] as const,
	},
	{
		iso_3166_1: "GR",
		zones: ["Europe/Athens"] as const,
	},
	{
		iso_3166_1: "GS",
		zones: ["Atlantic/South_Georgia"] as const,
	},
	{
		iso_3166_1: "GT",
		zones: ["America/Guatemala"] as const,
	},
	{
		iso_3166_1: "GU",
		zones: ["Pacific/Guam"] as const,
	},
	{
		iso_3166_1: "GW",
		zones: ["Africa/Bissau"] as const,
	},
	{
		iso_3166_1: "GY",
		zones: ["America/Guyana"] as const,
	},
	{
		iso_3166_1: "HK",
		zones: ["Asia/Hong_Kong"] as const,
	},
	{
		iso_3166_1: "HM",
		zones: [] as const,
	},
	{
		iso_3166_1: "HN",
		zones: ["America/Tegucigalpa"] as const,
	},
	{
		iso_3166_1: "HR",
		zones: ["Europe/Belgrade"] as const,
	},
	{
		iso_3166_1: "HT",
		zones: ["America/Port-au-Prince"] as const,
	},
	{
		iso_3166_1: "HU",
		zones: ["Europe/Budapest"] as const,
	},
	{
		iso_3166_1: "ID",
		zones: ["Asia/Jakarta", "Asia/Pontianak", "Asia/Makassar", "Asia/Jayapura"] as const,
	},
	{
		iso_3166_1: "IE",
		zones: ["Europe/Dublin"] as const,
	},
	{
		iso_3166_1: "IL",
		zones: ["Asia/Jerusalem"] as const,
	},
	{
		iso_3166_1: "IM",
		zones: ["Europe/London"] as const,
	},
	{
		iso_3166_1: "IN",
		zones: ["Asia/Kolkata"] as const,
	},
	{
		iso_3166_1: "IO",
		zones: ["Indian/Chagos"] as const,
	},
	{
		iso_3166_1: "IQ",
		zones: ["Asia/Baghdad"] as const,
	},
	{
		iso_3166_1: "IR",
		zones: ["Asia/Tehran"] as const,
	},
	{
		iso_3166_1: "IS",
		zones: ["Africa/Abidjan"] as const,
	},
	{
		iso_3166_1: "IT",
		zones: ["Europe/Rome"] as const,
	},
	{
		iso_3166_1: "JE",
		zones: ["Europe/London"] as const,
	},
	{
		iso_3166_1: "JM",
		zones: ["America/Jamaica"] as const,
	},
	{
		iso_3166_1: "JO",
		zones: ["Asia/Amman"] as const,
	},
	{
		iso_3166_1: "JP",
		zones: ["Asia/Tokyo"] as const,
	},
	{
		iso_3166_1: "KE",
		zones: ["Africa/Nairobi"] as const,
	},
	{
		iso_3166_1: "KG",
		zones: ["Asia/Bishkek"] as const,
	},
	{
		iso_3166_1: "KH",
		zones: ["Asia/Bangkok"] as const,
	},
	{
		iso_3166_1: "KI",
		zones: ["Pacific/Tarawa", "Pacific/Kanton", "Pacific/Kiritimati"] as const,
	},
	{
		iso_3166_1: "KM",
		zones: ["Africa/Nairobi"] as const,
	},
	{
		iso_3166_1: "KN",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "KP",
		zones: ["Asia/Pyongyang"] as const,
	},
	{
		iso_3166_1: "KR",
		zones: ["Asia/Seoul"] as const,
	},
	{
		iso_3166_1: "KW",
		zones: ["Asia/Riyadh"] as const,
	},
	{
		iso_3166_1: "KY",
		zones: ["America/Panama"] as const,
	},
	{
		iso_3166_1: "KZ",
		zones: ["Asia/Almaty", "Asia/Qyzylorda", "Asia/Qostanay", "Asia/Aqtobe", "Asia/Aqtau", "Asia/Atyrau", "Asia/Oral"] as const,
	},
	{
		iso_3166_1: "LA",
		zones: ["Asia/Bangkok"] as const,
	},
	{
		iso_3166_1: "LB",
		zones: ["Asia/Beirut"] as const,
	},
	{
		iso_3166_1: "LC",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "LI",
		zones: ["Europe/Zurich"] as const,
	},
	{
		iso_3166_1: "LK",
		zones: ["Asia/Colombo"] as const,
	},
	{
		iso_3166_1: "LR",
		zones: ["Africa/Monrovia"] as const,
	},
	{
		iso_3166_1: "LS",
		zones: ["Africa/Johannesburg"] as const,
	},
	{
		iso_3166_1: "LT",
		zones: ["Europe/Vilnius"] as const,
	},
	{
		iso_3166_1: "LU",
		zones: ["Europe/Brussels"] as const,
	},
	{
		iso_3166_1: "LV",
		zones: ["Europe/Riga"] as const,
	},
	{
		iso_3166_1: "LY",
		zones: ["Africa/Tripoli"] as const,
	},
	{
		iso_3166_1: "MA",
		zones: ["Africa/Casablanca"] as const,
	},
	{
		iso_3166_1: "MC",
		zones: ["Europe/Paris"] as const,
	},
	{
		iso_3166_1: "MD",
		zones: ["Europe/Chisinau"] as const,
	},
	{
		iso_3166_1: "ME",
		zones: ["Europe/Belgrade"] as const,
	},
	{
		iso_3166_1: "MF",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "MG",
		zones: ["Africa/Nairobi"] as const,
	},
	{
		iso_3166_1: "MH",
		zones: ["Pacific/Kwajalein", "Pacific/Tarawa"] as const,
	},
	{
		iso_3166_1: "MK",
		zones: ["Europe/Belgrade"] as const,
	},
	{
		iso_3166_1: "ML",
		zones: ["Africa/Abidjan"] as const,
	},
	{
		iso_3166_1: "MM",
		zones: ["Asia/Yangon"] as const,
	},
	{
		iso_3166_1: "MN",
		zones: ["Asia/Ulaanbaatar", "Asia/Hovd", "Asia/Choibalsan"] as const,
	},
	{
		iso_3166_1: "MO",
		zones: ["Asia/Macau"] as const,
	},
	{
		iso_3166_1: "MP",
		zones: ["Pacific/Guam"] as const,
	},
	{
		iso_3166_1: "MQ",
		zones: ["America/Martinique"] as const,
	},
	{
		iso_3166_1: "MR",
		zones: ["Africa/Abidjan"] as const,
	},
	{
		iso_3166_1: "MS",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "MT",
		zones: ["Europe/Malta"] as const,
	},
	{
		iso_3166_1: "MU",
		zones: ["Indian/Mauritius"] as const,
	},
	{
		iso_3166_1: "MV",
		zones: ["Indian/Maldives"] as const,
	},
	{
		iso_3166_1: "MW",
		zones: ["Africa/Maputo"] as const,
	},
	{
		iso_3166_1: "MX",
		zones: [
			"America/Mexico_City",
			"America/Cancun",
			"America/Merida",
			"America/Monterrey",
			"America/Matamoros",
			"America/Chihuahua",
			"America/Ciudad_Juarez",
			"America/Ojinaga",
			"America/Mazatlan",
			"America/Bahia_Banderas",
			"America/Hermosillo",
			"America/Tijuana",
		] as const,
	},
	{
		iso_3166_1: "MY",
		zones: ["Asia/Kuching", "Asia/Singapore"] as const,
	},
	{
		iso_3166_1: "MZ",
		zones: ["Africa/Maputo"] as const,
	},
	{
		iso_3166_1: "NA",
		zones: ["Africa/Windhoek"] as const,
	},
	{
		iso_3166_1: "NC",
		zones: ["Pacific/Noumea"] as const,
	},
	{
		iso_3166_1: "NE",
		zones: ["Africa/Lagos"] as const,
	},
	{
		iso_3166_1: "NF",
		zones: ["Pacific/Norfolk"] as const,
	},
	{
		iso_3166_1: "NG",
		zones: ["Africa/Lagos"] as const,
	},
	{
		iso_3166_1: "NI",
		zones: ["America/Managua"] as const,
	},
	{
		iso_3166_1: "NL",
		zones: ["Europe/Brussels"] as const,
	},
	{
		iso_3166_1: "NO",
		zones: ["Europe/Berlin"] as const,
	},
	{
		iso_3166_1: "NP",
		zones: ["Asia/Kathmandu"] as const,
	},
	{
		iso_3166_1: "NR",
		zones: ["Pacific/Nauru"] as const,
	},
	{
		iso_3166_1: "NU",
		zones: ["Pacific/Niue"] as const,
	},
	{
		iso_3166_1: "NZ",
		zones: ["Pacific/Auckland", "Pacific/Chatham"] as const,
	},
	{
		iso_3166_1: "OM",
		zones: ["Asia/Dubai"] as const,
	},
	{
		iso_3166_1: "PA",
		zones: ["America/Panama"] as const,
	},
	{
		iso_3166_1: "PE",
		zones: ["America/Lima"] as const,
	},
	{
		iso_3166_1: "PF",
		zones: ["Pacific/Tahiti", "Pacific/Marquesas", "Pacific/Gambier"] as const,
	},
	{
		iso_3166_1: "PG",
		zones: ["Pacific/Port_Moresby", "Pacific/Bougainville"] as const,
	},
	{
		iso_3166_1: "PH",
		zones: ["Asia/Manila"] as const,
	},
	{
		iso_3166_1: "PK",
		zones: ["Asia/Karachi"] as const,
	},
	{
		iso_3166_1: "PL",
		zones: ["Europe/Warsaw"] as const,
	},
	{
		iso_3166_1: "PM",
		zones: ["America/Miquelon"] as const,
	},
	{
		iso_3166_1: "PN",
		zones: ["Pacific/Pitcairn"] as const,
	},
	{
		iso_3166_1: "PR",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "PS",
		zones: ["Asia/Gaza", "Asia/Hebron"] as const,
	},
	{
		iso_3166_1: "PT",
		zones: ["Europe/Lisbon", "Atlantic/Madeira", "Atlantic/Azores"] as const,
	},
	{
		iso_3166_1: "PW",
		zones: ["Pacific/Palau"] as const,
	},
	{
		iso_3166_1: "PY",
		zones: ["America/Asuncion"] as const,
	},
	{
		iso_3166_1: "QA",
		zones: ["Asia/Qatar"] as const,
	},
	{
		iso_3166_1: "RE",
		zones: ["Asia/Dubai"] as const,
	},
	{
		iso_3166_1: "RO",
		zones: ["Europe/Bucharest"] as const,
	},
	{
		iso_3166_1: "RS",
		zones: ["Europe/Belgrade"] as const,
	},
	{
		iso_3166_1: "RU",
		zones: [
			"Europe/Kaliningrad",
			"Europe/Moscow",
			"Europe/Simferopol",
			"Europe/Kirov",
			"Europe/Volgograd",
			"Europe/Astrakhan",
			"Europe/Saratov",
			"Europe/Ulyanovsk",
			"Europe/Samara",
			"Asia/Yekaterinburg",
			"Asia/Omsk",
			"Asia/Novosibirsk",
			"Asia/Barnaul",
			"Asia/Tomsk",
			"Asia/Novokuznetsk",
			"Asia/Krasnoyarsk",
			"Asia/Irkutsk",
			"Asia/Chita",
			"Asia/Yakutsk",
			"Asia/Khandyga",
			"Asia/Ust-Nera",
			"Asia/Magadan",
			"Asia/Sakhalin",
			"Asia/Srednekolymsk",
			"Asia/Kamchatka",
			"Asia/Anadyr",
		] as const,
	},
	{
		iso_3166_1: "RW",
		zones: ["Africa/Maputo"] as const,
	},
	{
		iso_3166_1: "SA",
		zones: ["Asia/Riyadh"] as const,
	},
	{
		iso_3166_1: "SB",
		zones: ["Pacific/Guadalcanal"] as const,
	},
	{
		iso_3166_1: "SC",
		zones: ["Asia/Dubai"] as const,
	},
	{
		iso_3166_1: "SD",
		zones: ["Africa/Khartoum"] as const,
	},
	{
		iso_3166_1: "SE",
		zones: ["Europe/Berlin"] as const,
	},
	{
		iso_3166_1: "SG",
		zones: ["Asia/Singapore"] as const,
	},
	{
		iso_3166_1: "SH",
		zones: ["Africa/Abidjan"] as const,
	},
	{
		iso_3166_1: "SI",
		zones: ["Europe/Belgrade"] as const,
	},
	{
		iso_3166_1: "SJ",
		zones: ["Europe/Berlin"] as const,
	},
	{
		iso_3166_1: "SK",
		zones: ["Europe/Prague"] as const,
	},
	{
		iso_3166_1: "SL",
		zones: ["Africa/Abidjan"] as const,
	},
	{
		iso_3166_1: "SM",
		zones: ["Europe/Rome"] as const,
	},
	{
		iso_3166_1: "SN",
		zones: ["Africa/Abidjan"] as const,
	},
	{
		iso_3166_1: "SO",
		zones: ["Africa/Nairobi"] as const,
	},
	{
		iso_3166_1: "SR",
		zones: ["America/Paramaribo"] as const,
	},
	{
		iso_3166_1: "SS",
		zones: ["Africa/Juba"] as const,
	},
	{
		iso_3166_1: "ST",
		zones: ["Africa/Sao_Tome"] as const,
	},
	{
		iso_3166_1: "SV",
		zones: ["America/El_Salvador"] as const,
	},
	{
		iso_3166_1: "SX",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "SY",
		zones: ["Asia/Damascus"] as const,
	},
	{
		iso_3166_1: "SZ",
		zones: ["Africa/Johannesburg"] as const,
	},
	{
		iso_3166_1: "TC",
		zones: ["America/Grand_Turk"] as const,
	},
	{
		iso_3166_1: "TD",
		zones: ["Africa/Ndjamena"] as const,
	},
	{
		iso_3166_1: "TF",
		zones: ["Asia/Dubai", "Indian/Maldives"] as const,
	},
	{
		iso_3166_1: "TG",
		zones: ["Africa/Abidjan"] as const,
	},
	{
		iso_3166_1: "TH",
		zones: ["Asia/Bangkok"] as const,
	},
	{
		iso_3166_1: "TJ",
		zones: ["Asia/Dushanbe"] as const,
	},
	{
		iso_3166_1: "TK",
		zones: ["Pacific/Fakaofo"] as const,
	},
	{
		iso_3166_1: "TL",
		zones: ["Asia/Dili"] as const,
	},
	{
		iso_3166_1: "TM",
		zones: ["Asia/Ashgabat"] as const,
	},
	{
		iso_3166_1: "TN",
		zones: ["Africa/Tunis"] as const,
	},
	{
		iso_3166_1: "TO",
		zones: ["Pacific/Tongatapu"] as const,
	},
	{
		iso_3166_1: "TR",
		zones: ["Europe/Istanbul"] as const,
	},
	{
		iso_3166_1: "TT",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "TV",
		zones: ["Pacific/Tarawa"] as const,
	},
	{
		iso_3166_1: "TW",
		zones: ["Asia/Taipei"] as const,
	},
	{
		iso_3166_1: "TZ",
		zones: ["Africa/Nairobi"] as const,
	},
	{
		iso_3166_1: "UA",
		zones: ["Europe/Kyiv", "Europe/Simferopol"] as const,
	},
	{
		iso_3166_1: "UG",
		zones: ["Africa/Nairobi"] as const,
	},
	{
		iso_3166_1: "UM",
		zones: ["Pacific/Pago_Pago", "Pacific/Tarawa"] as const,
	},
	{
		iso_3166_1: "US",
		zones: [
			"America/New_York",
			"America/Detroit",
			"America/Kentucky/Louisville",
			"America/Kentucky/Monticello",
			"America/Indiana/Indianapolis",
			"America/Indiana/Vincennes",
			"America/Indiana/Winamac",
			"America/Indiana/Marengo",
			"America/Indiana/Petersburg",
			"America/Indiana/Vevay",
			"America/Chicago",
			"America/Indiana/Tell_City",
			"America/Indiana/Knox",
			"America/Menominee",
			"America/North_Dakota/Center",
			"America/North_Dakota/New_Salem",
			"America/North_Dakota/Beulah",
			"America/Denver",
			"America/Boise",
			"America/Phoenix",
			"America/Los_Angeles",
			"America/Anchorage",
			"America/Juneau",
			"America/Sitka",
			"America/Metlakatla",
			"America/Yakutat",
			"America/Nome",
			"America/Adak",
			"Pacific/Honolulu",
		] as const,
	},
	{
		iso_3166_1: "UY",
		zones: ["America/Montevideo"] as const,
	},
	{
		iso_3166_1: "UZ",
		zones: ["Asia/Samarkand", "Asia/Tashkent"] as const,
	},
	{
		iso_3166_1: "VA",
		zones: ["Europe/Rome"] as const,
	},
	{
		iso_3166_1: "VC",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "VE",
		zones: ["America/Caracas"] as const,
	},
	{
		iso_3166_1: "VG",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "VI",
		zones: ["America/Puerto_Rico"] as const,
	},
	{
		iso_3166_1: "VN",
		zones: ["Asia/Ho_Chi_Minh", "Asia/Bangkok"] as const,
	},
	{
		iso_3166_1: "VU",
		zones: ["Pacific/Efate"] as const,
	},
	{
		iso_3166_1: "WF",
		zones: ["Pacific/Tarawa"] as const,
	},
	{
		iso_3166_1: "WS",
		zones: ["Pacific/Apia"] as const,
	},
	{
		iso_3166_1: "YE",
		zones: ["Asia/Riyadh"] as const,
	},
	{
		iso_3166_1: "YT",
		zones: ["Africa/Nairobi"] as const,
	},
	{
		iso_3166_1: "ZA",
		zones: ["Africa/Johannesburg"] as const,
	},
	{
		iso_3166_1: "ZM",
		zones: ["Africa/Maputo"] as const,
	},
	{
		iso_3166_1: "ZW",
		zones: ["Africa/Maputo"] as const,
	},
] as const;
