// Fluent Emoji 3D assets (c) Microsoft, MIT license — github.com/microsoft/fluentui-emoji
import backpack from "../assets/icons3d/backpack.png";
import beach from "../assets/icons3d/beach.png";
import bed from "../assets/icons3d/bed.png";
import broom from "../assets/icons3d/broom.png";
import calendar from "../assets/icons3d/calendar.png";
import camping from "../assets/icons3d/camping.png";
import city from "../assets/icons3d/city.png";
import compass from "../assets/icons3d/compass.png";
import creditcard from "../assets/icons3d/creditcard.png";
import cruise from "../assets/icons3d/cruise.png";
import flight from "../assets/icons3d/flight.png";
import floppy from "../assets/icons3d/floppy.png";
import flower from "../assets/icons3d/flower.png";
import food from "../assets/icons3d/food.png";
import gear from "../assets/icons3d/gear.png";
import globe from "../assets/icons3d/globe.png";
import hiking from "../assets/icons3d/hiking.png";
import hotel from "../assets/icons3d/hotel.png";
import inbox from "../assets/icons3d/inbox.png";
import landmark from "../assets/icons3d/landmark.png";
import luggage from "../assets/icons3d/luggage.png";
import memo from "../assets/icons3d/memo.png";
import moneybag from "../assets/icons3d/moneybag.png";
import mountain from "../assets/icons3d/mountain.png";
import mountainSnow from "../assets/icons3d/mountain-snow.png";
import music from "../assets/icons3d/music.png";
import pencil from "../assets/icons3d/pencil.png";
import pin from "../assets/icons3d/pin.png";
import plane from "../assets/icons3d/plane.png";
import roadtrip from "../assets/icons3d/roadtrip.png";
import romance from "../assets/icons3d/romance.png";
import search from "../assets/icons3d/search.png";
import shopping from "../assets/icons3d/shopping.png";
import snowflake from "../assets/icons3d/snowflake.png";
import sun from "../assets/icons3d/sun.png";
import taxi from "../assets/icons3d/taxi.png";
import themepark from "../assets/icons3d/themepark.png";
import ticket from "../assets/icons3d/ticket.png";
import train from "../assets/icons3d/train.png";
import tram from "../assets/icons3d/tram.png";
import trash from "../assets/icons3d/trash.png";
import waves from "../assets/icons3d/waves.png";
import work from "../assets/icons3d/work.png";

/** Icon id → 3D image URL. Trips and destinations store the id. */
export const ICON_MAP: Record<string, string> = {
  backpack,
  beach,
  bed,
  broom,
  calendar,
  camping,
  city,
  compass,
  creditcard,
  cruise,
  flight,
  floppy,
  flower,
  food,
  gear,
  globe,
  hiking,
  hotel,
  inbox,
  landmark,
  luggage,
  memo,
  moneybag,
  mountain,
  "mountain-snow": mountainSnow,
  music,
  pencil,
  pin,
  plane,
  roadtrip,
  romance,
  search,
  shopping,
  snowflake,
  sun,
  taxi,
  themepark,
  ticket,
  train,
  tram,
  trash,
  waves,
  work,
};

export function getIconSrc(id: string): string {
  return ICON_MAP[id] ?? ICON_MAP.globe;
}

export const TRIP_ICON_CHOICES: { id: string; label: string }[] = [
  { id: "globe", label: "Globe" },
  { id: "beach", label: "Beach" },
  { id: "mountain", label: "Mountains" },
  { id: "city", label: "City" },
  { id: "backpack", label: "Backpacking" },
  { id: "flight", label: "Flight" },
  { id: "roadtrip", label: "Road trip" },
  { id: "cruise", label: "Cruise" },
  { id: "camping", label: "Camping" },
  { id: "themepark", label: "Theme park" },
  { id: "work", label: "Work" },
  { id: "romance", label: "Romance" },
];

/** Maps trip icons stored as emoji by earlier builds onto icon ids. */
export const LEGACY_EMOJI_ICONS: Record<string, string> = {
  "🌍": "globe",
  "🏝️": "beach",
  "⛰️": "mountain",
  "🏔️": "mountain-snow",
  "🏙️": "city",
  "🎒": "backpack",
  "🛫": "flight",
  "🚗": "roadtrip",
  "🛳️": "cruise",
  "🏕️": "camping",
  "🎢": "themepark",
  "💼": "work",
  "❤️": "romance",
  "🌊": "waves",
};
