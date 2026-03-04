# PersonaLifeRN

[English](#english) | [中文](#chinese)

<a name="english"></a>
## 🎭 PersonaLifeRN (English)

**PersonaLifeRN** is a gamified life tracking application built with **React Native (Expo)**, inspired by the social stat systems of the **Persona** game series (Persona 3, 4, and 5).

It allows you to log your daily activities and feelings, which are then analyzed by AI to award you points in various social stats (e.g., Knowledge, Courage, Charm). Watch your real-life stats grow and level up just like a Phantom Thief, Investigation Team member, or S.E.E.S. operative!

### ✨ Key Features

*   **🎨 Multi-Theme Support**:
    *   **Persona 5**: Stylish red/black jagged aesthetic.
    *   **Persona 4**: Retro yellow/orange TV-world vibe.
    *   **Persona 3**: Cool blue/glass-cut Dark Hour atmosphere.
*   **🧠 AI-Powered Analysis**:
    *   Input your daily activity (e.g., "Studied React Native") and feeling.
    *   The app uses an AI model (OpenAI API compatible) to analyze the context and award appropriate stat points.
*   **📊 Dynamic Stat Radar**:
    *   Animated radar chart that changes shape and style based on the selected theme.
    *   Real-time animations when stats update or themes change.
*   **📈 Level Up System**:
    *   Stats have 5 ranks with specific titles for each theme (e.g., "Learned", "Professor", "Genius").
    *   Experience satisfying "Rank Up" events.
*   **💾 Data Management**:
    *   Local storage of all activities.
    *   Import/Export data functionality (JSON) for backup.
    *   **Demo Mode**: Preview what maxed-out stats look like in different themes.
*   **🌍 Internationalization**:
    *   Full support for English and Chinese (Simplified).

### 🛠 Tech Stack

*   **Framework**: React Native (Expo SDK 52)
*   **Language**: TypeScript
*   **Routing**: Expo Router
*   **Animations**: React Native Reanimated
*   **Graphics**: React Native SVG
*   **Styling**: NativeWind (Tailwind CSS) & Custom Theme System
*   **State/Storage**: React Context API & AsyncStorage

### 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/PersonaLifeRN.git
    cd PersonaLifeRN
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the app**
    ```bash
    npx expo start
    ```

### ⚙️ Configuration

To use the AI analysis feature, you need to configure your API settings:

1.  Open the app and navigate to the **Velvet Room** (Settings icon).
2.  Enter your **API Key** (OpenAI format).
3.  (Optional) Enter a **Base URL** if you are using a proxy or a compatible service (e.g., DeepSeek, local LLM).
4.  Save the contract!

---

<a name="chinese"></a>
## 🎭 PersonaLifeRN (中文)

**PersonaLifeRN** 是一款基于 **React Native (Expo)** 开发的生活记录与游戏化应用，致敬了 **女神异闻录 (Persona)** 系列（P3, P4, P5）的五维/三维属性系统。

你可以记录每天的活动和感受，应用会通过 AI 分析这些内容，为你增加相应的社会属性点数（如知识、勇气、魅力等）。像怪盗团、自称特别搜查队或 S.E.E.S. 成员一样，在现实生活中不断升级你的五维吧！

### ✨ 核心功能

*   **🎨 多主题切换**:
    *   **Persona 5**: 潮酷的红黑配色与锯齿风格 UI。
    *   **Persona 4**: 复古的黄橙配色与电视迷雾风格。
    *   **Persona 3**: 冷峻的蓝白配色与玻璃切割风格。
*   **🧠 AI 智能分析**:
    *   输入你的日常活动（例如：“学习 React Native”）和感受。
    *   应用调用 AI 模型（兼容 OpenAI API）分析语义，自动判别并奖励相应的属性点数。
*   **📊 动态雷达图**:
    *   根据不同主题呈现不同形状和视觉效果的属性雷达图。
    *   支持实时动画过渡，数据变化或切换主题时丝滑流畅。
*   **📈 升级系统**:
    *   每个属性拥有 5 个等级，并对应各代游戏中的经典称号（如“博识”、“教授”、“天才”）。
    *   触发令人满足的“Rank Up”升级事件。
*   **💾 数据管理**:
    *   本地存储所有活动记录。
    *   支持数据导入/导出 (JSON)，方便备份与迁移。
    *   **演示模式 (Demo Mode)**: 即使没有数据，也能预览全属性满级时的酷炫效果。
*   **🌍 多语言支持**:
    *   完整支持简体中文和英文。

### 🛠 技术栈

*   **框架**: React Native (Expo SDK 52)
*   **语言**: TypeScript
*   **路由**: Expo Router
*   **动画**: React Native Reanimated
*   **图形**: React Native SVG
*   **样式**: NativeWind (Tailwind CSS) & 自定义主题系统
*   **状态/存储**: React Context API & AsyncStorage

### 🚀 快速开始

1.  **克隆项目**
    ```bash
    git clone https://github.com/yourusername/PersonaLifeRN.git
    cd PersonaLifeRN
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动应用**
    ```bash
    npx expo start
    ```

### ⚙️ 配置说明

为了使用 AI 分析功能，你需要配置 API 信息：

1.  打开应用，点击右下角的 **Velvet Room** (天鹅绒房间/设置图标)。
2.  输入你的 **API Key** (OpenAI 格式)。
3.  (可选) 如果使用代理或兼容服务（如 DeepSeek、本地 LLM），请输入 **Base URL**。
4.  保存契约！
