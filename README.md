# Yuno - Real-Time Project Synchronization

Yuno is the first NPM package for real-time peer-to-peer project synchronization, enabling teams to code together like Google Docs but for entire projects.
Yuno lets you know what your team is building - as they build it.

## Features

- **Real-time P2P synchronization** of code, dependencies, and console output
- **No manual merges** - changes sync automatically between collaborators
- **End-to-end encryption** protects your code
- **Universal file support** - works with any file type across IDEs and editors
- **Zero configuration** setup

## Installation

```bash
npm install yuno-mfs
```

## Quick Start

1. Create a new Yuno room:
```bash
npx yuno create -r [room-name]
```

2. Initialize your configuration:
```bash
npx yuno init -r [room-name] -p [password] -u [username]
```

3. Start collaborating:
```bash
npx yuno start
```

## Core Technology

1. **P2P Network**: Developers connect directly without central servers
2. **Automatic Sync**: Code changes propagate in real-time
3. **Conflict Resolution**: Last-write-wins policy based on timestamps
4. **Encrypted Connections**: Your data stays private

## Use Cases

- Pair programming without VSCode Live Share
- Hackathons with distributed teams
- Real-time coding education
- Collaborative open-source development
- Any file-based collaboration

## Why Choose Yuno?

🔒 **Military-Grade Security**: End-to-end encrypted connections  
⚡ **Blazing Fast**: Direct P2P connections with no middleman delays  
🌐 **Universal Support**: Works with any files across all platforms  
🚀 **Zero Configuration**: Get started in seconds  

## Comparison to Alternatives

Unlike cloud-based tools (Google Drive, Dropbox) or editor-specific solutions (Live Share), Yuno offers:
- True P2P architecture with no file size limits
- Cross-platform compatibility
- Instant change propagation
- No subscription fees or account requirements

## Links

- [![GitHub](https://raw.githubusercontent.com/AbuZhuma/assets/main/icons/github.svg)](https://github.com/AbuZhuma/yuno-mfs)
- [![NPM](https://raw.githubusercontent.com/AbuZhuma/assets/main/icons/npm.svg)](https://www.npmjs.com/package/yuno-mfs)   
- [![Hashnode](https://raw.githubusercontent.com/AbuZhuma/assets/main/icons/hashnode.svg)](https://hashnode.com/@abuzhuma) 
- [![Dev.to](https://raw.githubusercontent.com/AbuZhuma/assets/main/icons/devto.svg)](https://dev.to/abdyrakhman_dzhumagulov_2) 
- [![Telegram](https://raw.githubusercontent.com/AbuZhuma/assets/main/icons/telegram.svg)](https://t.me/yuno_mfs) 
- [![Hacker News](https://raw.githubusercontent.com/AbuZhuma/assets/main/icons/hackernews.svg)](https://news.ycombinator.com/user?id=Abdyrahman) 
- [![YouTube](https://raw.githubusercontent.com/AbuZhuma/assets/main/icons/youtube.svg)](https://www.youtube.com/channel/UCtTG_6zWsaSHfLoiD2wQLKw) 
- [📄 Documentation](https://yuno.ws/docs)

## License

You are granted a non-transferable, non-exclusive right to use this software only for personal or internal business purposes.

© 2025 Yuno-mfs. All rights reserved.