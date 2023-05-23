const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Updated to use the environment variable PORT if available, or use port 3000 by default

// Create main route
app.get('/', (req, res) => res.send('Hello World!'));

// Instantiate server
const server = app.listen(port, () =>
  console.log(`App is listening at http://localhost:${port}`)
);

// Added code to keep the server alive in the Replit web view
if (process.env.REPLIT_DB_URL) {
  const http = require('http');
  setInterval(() => {
    http.get(`http://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  }, 60000);
}

// SQLite database setup
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('streaming_data.db');

// Create users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    streaming_time INTEGER DEFAULT 0
  )
`);


const Discord = require('discord.js');
const client = new Discord.Client();

const userStreamStartTimes = new Map();
const notificationChannelId = '1109402677185613834'; // Replace with the ID of the channel where you want to send the notifications

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});



client.on('message', (message) => {
  if (message.author.bot) return; // Ignore messages from other bots

  const userId = message.author.id;
  const userStreamStartTime = userStreamStartTimes.get(userId);

  if (message.content.toLowerCase() === 'stream on') {
    if (!userStreamStartTime) {
      userStreamStartTimes.set(userId, new Date());
      message.reply('<a:996254430141894726:1109423158974480464> Stream Started <:Green:1109424176047071322>');

      // Update the streaming time for the user in the database
      db.run(
        `INSERT INTO users (id, streaming_time) VALUES (?, 0)
        ON CONFLICT(id) DO NOTHING`,
        [userId]
      );
    } else {
      message.reply('<a:996254430141894726:1109423158974480464> You have already started streaming <:Green:1109424176047071322>');
    }
  } else if (message.content.toLowerCase() === 'stream off') {
    if (userStreamStartTime) {
      const streamOffTime = new Date();
      const timeGap = streamOffTime - userStreamStartTime;
      const seconds = Math.floor(timeGap / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const durationMessage = `Stream duration: ${minutes} minutes and ${remainingSeconds} seconds.`;

      userStreamStartTimes.delete(userId);

      // Send a simple stream off message
      message.reply('<a:958932551886569535:1109423216902025239> Stream Ended <:topggDotRed:1109424672329707560>');

      // Sending the stream off and duration message to the user
      client.fetchUser(userId).then((user) => {
        user.send('<a:958932551886569535:1109423216902025239> Your stream is off <:topggDotRed:1109424672329707560>');
        user.send(durationMessage);
      });

      // Sending the same message to the notification channel
      const notificationChannel = client.channels.get(notificationChannelId);
      if (notificationChannel && notificationChannel.type === 'text') {
        notificationChannel.send(`<a:958932551886569535:1109423216902025239> Stream off for user ${userId} <:topggDotRed:1109424672329707560>`);
        notificationChannel.send(durationMessage);
      }

      // Update the streaming time for the user in the database
      db.run(
        `UPDATE users SET streaming_time = streaming_time + ? WHERE id = ?`,
        [timeGap, userId]
      );
    } else {
      message.reply('You have not started streaming.');
    }
  } else if (message.content.toLowerCase() === '!data') {
    // Retrieve the streaming data from the database
    db.all(`SELECT * FROM users`, [], (err, rows) => {
      if (err) {
        console.error(err);
        return;
      }

      let dataMessage = 'Streaming Data:\n\n';
      rows.forEach((row) => {
        const { id, username, streaming_time } = row;
        dataMessage += `User: ${username} (ID: ${id})\nStreaming Time: ${streaming_time} seconds\n\n`;
      });

      // Send the data message to the channel
      message.channel.send(dataMessage);
    });
  }
});

// Function to check the online status of users
function checkUserStatus() {
  client.guilds.forEach((guild) => {
    guild.fetchMembers().then((guild) => {
      guild.members.forEach((member) => {
        const userId = member.user.id;
        const userStreamStartTime = userStreamStartTimes.get(userId);

        if (userStreamStartTime && member.presence.status === 'offline') {
          const streamOffTime = new Date();
          const timeGap = streamOffTime - userStreamStartTime;
          const seconds = Math.floor(timeGap / 1000);
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          const durationMessage = `<a:76:1109417947589513226> Your stream duration: ${minutes} minutes and ${remainingSeconds} seconds.`;

          // Sending the stream off and duration message to the user
          client.fetchUser(userId).then((user) => {
            user.send('<a:958932551886569535:1109423216902025239> Your stream is off <:topggDotRed:1109424672329707560>');
            user.send(durationMessage);
          });

          // Sending the same message to the notification channel
          const notificationChannel = client.channels.get(notificationChannelId);
          if (notificationChannel && notificationChannel.type === 'text') {
            notificationChannel.send(`<a:958932551886569535:1109423216902025239> Stream off for user ${userId} <:topggDotRed:1109424672329707560>`);
            notificationChannel.send(durationMessage);
          }

          userStreamStartTimes.delete(userId);

          // Update the streaming time for the user in the database
          db.run(
            `UPDATE users SET streaming_time = streaming_time + ? WHERE id = ?`,
            [timeGap, userId]
          );
        }
      });
    });
  });
}
client.on('message', (message) => {
  if (message.author.bot) return; // Ignore messages from other bots

  const userId = message.author.id;
  const userStreamStartTime = userStreamStartTimes.get(userId);

  if (message.content.toLowerCase() === 'stream on') {
    // ...
  } else if (message.content.toLowerCase() === 'stream off') {
    // ...
  } else if (message.content.toLowerCase() === '!streamers') {
    message.channel.send('\n1) Mohammedi#2456           :    961980949107707985 \n2) ƙ¡ƞǤ ɱƦƙ#3055               :    443088644803395595 \n3) 丂卄ㄖ山尺ㄖ乃#6705  :    515741819602993153  \n4) Baki#2797                          :    744997602201698387 \n5) YogaDS#6123                    :    811464349575020574  \n6) WaqarYounas#7220        :    997899914321350696  \n7) 𝒯 𝓊 𝐻 𝒾 𝒩 #2266             :    516571286143631365   \n8) 𓂀 𝕌𝕤𝕒𝕞𝕒 𓂀#7172         :    516571286143631365 \n9) Biswas#4345                    :    625653061779587082  \n10) 𝐕𝐍-𝐆𝐋𝐎𝐎𝐌𝐘#9743      :    1033765264631808020  \n11) RTX#2955                         :    1004206704994566164  \n12) ANASKHALID#7458      :    521594064550756363  \n13) mohamedmo3tz#4951 :   1062125233529683968\n14) egoben256#3887            :  1085597434572447744\n15) VN-WAJAHAT#9067      :   893904447430881341  \n16) ᴠєɴǵєαɴɔє #6094            :  966595157808021584\n17) 𝓥𝓝 𝓗𝓐𝓢𝓢𝓐𝓝#1429  : 1059025596048482354');
  }
});


client.on('ready', () => {
  console.log(`RTXX!`);
  client.user.setStatus('available');
  client.user.setPresence({
    activity: {
      name: 'VNHax Official',
      type: 'PLAYING',
      url: 'https://www.twitch.tv/RTX',
    },
  });
});

client.login(`MTEwOTM5MjExNTgyMzMwMDY5OQ.GuOUWg.Yd25D-7tAMR4cxGpADbFQi3Cp65-7iNTnDVqUk`);

// Periodically check the user status every 5 minutes
setInterval(checkUserStatus, 5 * 60 * 1000);
