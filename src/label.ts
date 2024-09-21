import { DID, PORT, SIGNING_KEY } from "./constants.js";
import { LabelerServer } from "@skyware/labeler";

const server = new LabelerServer({ did: DID, signingKey: SIGNING_KEY });

server.start(PORT, (error, address) => {
  if (error) console.error(error);
  else console.log(`Labeler server listening on ${address}`);
});

export const label_video = async (uri: string) => {
  const time = new Date().toISOString();
  await server
    .createLabel({ uri: uri, val: "video" })
    .catch((err) => console.log(err))
    .then(() => console.log(`${time}: Labeled video: ${uri}`));
};
