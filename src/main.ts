import { labelGif } from './label.js'
import fs from "node:fs";
import { Jetstream } from "@skyware/jetstream";
import {JETSTREAM_ENDPOINT} from './constants.js'

let intervalID: NodeJS.Timeout;
const cursorFile = fs.readFileSync("cursor.txt", "utf8");
if (cursorFile) console.log(`Initiate firehose at cursor ${cursorFile}`);

const jetstream = new Jetstream({
  endpoint: JETSTREAM_ENDPOINT,
  wantedCollections: ["app.bsky.feed.post"],
  cursor: cursorFile ?? 0,
});

jetstream.on("open", () => {
  intervalID = setInterval(() => {
    if (jetstream.cursor) {
      console.log(`${new Date().toISOString()}: ${jetstream.cursor}`);
      fs.writeFile("cursor.txt", jetstream.cursor.toString(), (err) => {
        if (err) console.log(err);
      });
    }
  }, 60000);
});

jetstream.on("error", (err) => console.error(err));

jetstream.on("close", () => clearInterval(intervalID));

jetstream.onCreate("app.bsky.feed.post", (event) => {
  const embed = event.commit.record.embed;

  if (!embed) return

  let externalEmbed

  if (embed.$type === "app.bsky.embed.external" && isGifUri(embed.external.uri)) {
    externalEmbed = embed
  } else if (embed.$type === 'app.bsky.embed.recordWithMedia' && embed.media.$type === 'app.bsky.embed.external' && isGifUri(embed.media.external.uri)) {
    externalEmbed = embed.media
  }

  if (externalEmbed) {
    const uri = `at://${event.did}/${event.commit.collection}/${event.commit.rkey}`;
    if (!event.commit.record.text || event.commit.record.text !== '') {
      // Disable for now because we need to queue
      // labelGifNoText(event.commit.)
    }
    labelGif(uri);
  }
});

const isGifUri = (uri: string) => uri.includes('media.tenor.com') && uri.includes('hh=') && uri.includes('ww=');

jetstream.start();
