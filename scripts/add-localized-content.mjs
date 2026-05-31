#!/usr/bin/env node
/**
 * Converts title/description to { en, pl } in events.json and places.json.
 * Run: node scripts/add-localized-content.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../src/data");

const eventTranslations = {
  "riverside-jazz": {
    pl: {
      title: "Sesje jazzu nad brzegiem",
      description:
        "Muzyka jazz na żywo nad wodą w każdą sobotę. Lokalni muzycy, rzemieślnicze napoje i widoki zachodu słońca nad rzeką.",
    },
  },
  "farmers-market": {
    pl: {
      title: "Sobotni targ rolniczy",
      description:
        "Świeże produkty, rzemieślniczy chleb, lokalny miód i street food od regionalnych sprzedawców. Cotygodniowy punkt spotkań społeczności.",
    },
  },
  "street-art-walk": {
    pl: {
      title: "Spacer po ukrytych muralach",
      description:
        "Odkryj murale i street art w zaułkach, których większość turystów nie zna. Prowadzenie przez lokalnych artystów.",
    },
  },
  "kids-science-lab": {
    pl: {
      title: "Weekend laboratorium nauki dla dzieci",
      description:
        "Eksperymenty dla dzieci w wieku 6–12 lat. Wulkany, magnesy i spotkania z młodymi entuzjastami nauki.",
    },
  },
  "sunrise-yoga": {
    pl: {
      title: "Poranna joga w parku",
      description:
        "Zacznij dzień od łagodnej jogi wśród starych dęb. Wszystkie poziomy mile widziane, maty zapewnione.",
    },
  },
  "tech-meetup": {
    pl: {
      title: "Lokalny meetup devów: AI i społeczność",
      description:
        "Comiesięczne spotkanie dla programistów i ciekawskich. Lightning talki, networking i pizza.",
    },
  },
  "heritage-walk": {
    pl: {
      title: "Spacer po dziedzictwie Starego Miasta",
      description:
        "Historie kupców, rewolucji i codziennego życia sprzed wieków. Małe grupy, wielka historia.",
    },
  },
  "night-food-festival": {
    pl: {
      title: "Nocny festiwal jedzenia",
      description:
        "Street food od ponad 20 lokalnych vendorów, DJ-e na żywo i pop-upowe bary z deserami. Największa noc jedzenia w mieście.",
    },
  },
  "community-garden": {
    pl: {
      title: "Dzień otwarty ogrodu społecznego",
      description:
        "Zwiedzanie wspólnych działek, wymiana nasion i porady urban gardening od sąsiedzkich ogrodników.",
    },
  },
  "indie-cinema": {
    pl: {
      title: "Kino niezależne: wieczór krótkich filmów",
      description:
        "Pokaz krótkometrażówek regionalnych twórców, po którym następuje Q&A z reżyserami.",
    },
  },
  "running-club": {
    pl: {
      title: "Niedzielny bieg towarzyski",
      description:
        "Swobodna pętla 5 km wzdłuż jeziornej ścieżki. Kawa i rozmowy potem w pobliskiej kawiarni.",
    },
  },
  "senior-tea": {
    pl: {
      title: "Popołudnie herbaty i gier dla seniorów",
      description:
        "Przyjazne popołudnie z herbatą, grami planszowymi i rozmową. Wstęp wolny, bez rezerwacji.",
    },
  },
};

const placeTranslations = {
  "old-town-riverside": {
    pl: {
      title: "Park nad rzeką w Starym Mieście",
      description:
        "Malowniczy bulwar nad rzeką z ławkami, ścieżkami spacerowymi i widokami zachodu słońca. Otwarty całą dobę na spokojny spacer lub piknik.",
    },
  },
  "greenwood-park": {
    pl: {
      title: "Park Greenwood",
      description:
        "Rozległy park miejski ze starymi dębami, placami zabaw i otwartymi łąkami. Idealny na jogę, jogging lub leniwe popołudnie.",
    },
  },
  "crystal-lake": {
    pl: {
      title: "Jezioro Crystal",
      description:
        "Spokojne jezioro otoczone 3 km pętlą tras. Wynajem kajaków latem, karmienie kaczek przez cały rok lub po prostu widoki na wodę.",
    },
  },
  "greenwood-forest-trail": {
    pl: {
      title: "Leśna ścieżka Greenwood",
      description:
        "Zacieniona 5 km leśna ścieżka przez sosnowy i brzozowy las. Obserwacja ptaków, grzybobranie i świeże powietrze z dala od zgiełku miasta.",
    },
  },
  "city-history-museum": {
    pl: {
      title: "Muzeum Historii Miasta",
      description:
        "Stałe wystawy historii lokalnej od średniowiecza po dziś. Interaktywne ekspozycje, przewodniki audio i taras na dachu.",
    },
  },
  "hilltop-castle": {
    pl: {
      title: "Ruiny zamku na wzgórzu",
      description:
        "Średniowieczne ruiny zamku na wzgórzu z panoramicznym widokiem na miasto. Wieże, dziedzińce i wieki historii we własnym tempie.",
    },
  },
  "botanical-gardens": {
    pl: {
      title: "Ogród botaniczny",
      description:
        "Cztery hektary ogrodów tematycznych — pawilon róż, tropikalna szklarnia i japoński zen. Całoroczna oaza koloru i spokoju.",
    },
  },
  "sunset-viewpoint": {
    pl: {
      title: "Punkt widokowy zachodu słońca",
      description:
        "Najlepszy punkt widokowy na dachy miasta i dolinę rzeki. Ławki, mała kawiarnia i niezapomniane widoki o złotej godzinie.",
    },
  },
  "children-adventure-park": {
    pl: {
      title: "Park przygód dla dzieci",
      description:
        "Place zabaw, brodzik, mini pociąg i strefy piknikowe dla rodzin. Wstęp wolny, opcjonalne kioski z przekąskami.",
    },
  },
  "old-town-square": {
    pl: {
      title: "Rynek Starego Miasta",
      description:
        "Historyczne serce miasta — brukowany plac, kawiarnie, uliczni artyści i architektura sprzed wieków. Zawsze tętni życiem.",
    },
  },
  "waterfront-promenade": {
    pl: {
      title: "Promenada nadbrzeżna",
      description:
        "Tętniący życiem 2 km deptak wzdłuż portu z restauracjami, ławkami i instalacjami sztuki publicznej. Świetny na wieczorny spacer.",
    },
  },
  "industrial-art-district": {
    pl: {
      title: "Dzielnica sztuki przemysłowej",
      description:
        "Dawne fabryki zamienione w galerie plenerowe i pracownie. Murale, rzeźby i wystawy pop-up, które można zwiedzać o każdej porze.",
    },
  },
};

function localizeItems(filePath, translationsMap) {
  const items = JSON.parse(readFileSync(filePath, "utf8"));
  for (const item of items) {
    const tr = translationsMap[item.id];
    const titleEn = typeof item.title === "string" ? item.title : item.title.en;
    const descEn =
      typeof item.description === "string" ? item.description : item.description.en;
    item.title = {
      en: titleEn,
      pl: tr?.pl?.title ?? titleEn,
    };
    item.description = {
      en: descEn,
      pl: tr?.pl?.description ?? descEn,
    };
  }
  writeFileSync(filePath, JSON.stringify(items, null, 2) + "\n");
}

localizeItems(join(dataDir, "events.json"), eventTranslations);
localizeItems(join(dataDir, "places.json"), placeTranslations);
console.log("Localized title/description in events.json and places.json");
