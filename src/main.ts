import { label_video } from "./label.js";
import fs from "node:fs";
import { Jetstream } from "@skyware/jetstream";

let intervalID: NodeJS.Timeout;
const cursorFile = fs.readFileSync("cursor.txt", "utf8");
if (cursorFile) console.log(`Initiate firehose at cursor ${cursorFile}`);

const jetstream = new Jetstream({
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
  if (
    event.commit.record.embed?.$type === "app.bsky.embed.video" ||
    (event.commit.record.embed?.$type === "app.bsky.embed.recordWithMedia" &&
      event.commit.record.embed.media.$type === "app.bsky.embed.video")
  )
    label_video(`at://${event.did}/app.bsky.feed.post/${event.commit.rkey}`);
});

jetstream.start();
