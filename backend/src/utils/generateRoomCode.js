import Room from "../schemas/rooms.schema.js";

const CHARSET = process.env.CHARSET;
const CODE_LENGTH = process.env.CODE_LENGTH;

export const generateRoomCode = async () => {
    let code;
    let exists = true;

    while (exists) {
        code = Array.from({ length: CODE_LENGTH })
          .map(() => CHARSET[Math.floor(Math.random() * CHARSET.length)])
          .join("");

        exists = await Room.exists({ roomCode: code });
    }

    return code;
};
