import { labelGif } from './label.js'
import { Jetstream } from "@skyware/jetstream";
import {JETSTREAM_ENDPOINT} from './constants.js'

const jetstream = new Jetstream({
  endpoint: JETSTREAM_ENDPOINT,
  wantedCollections: ["app.bsky.feed.post"],
});

jetstream.on("error", (err) => console.error(err));

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
