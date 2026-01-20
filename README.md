# KCFlow

[![npm version](https://img.shields.io/npm/v/@kcflow/cli?color=indigo&style=flat-square)](https://www.npmjs.com/package/@kcflow/cli)
[![License](https://img.shields.io/npm/l/@kcflow/cli?color=blue&style=flat-square)](LICENSE)
[![Downloads](https://img.shields.io/npm/dt/@kcflow/cli?style=flat-square)](https://www.npmjs.com/package/@kcflow/cli)
[![PRPAG Holding](https://img.shields.io/badge/maintained%20by-PRPAG%20HOLDING-0f172a?style=flat-square)](https://holding.prpag.com)

**TypeSafe End-to-End API Builder for Modern Web Development.**

> **Status:** 🚧 **Public Beta** - We are actively improving KCFlow. Feedback is welcome!

---

## ⚡ Why KCFlow?

Stop writing repetitive API clients and router definitions manually. KCFlow allows you to define your API **once** in a TypeScript spec, and automatically generates:

- 🚀 **Type-Safe Client SDKs** (Axios or Fetch)
- 🛡️ **Express Routers** with built-in validation
- 📦 **TypeScript Definitions** shared between Frontend & Backend
- 📄 **OpenAPI / Swagger** documentation (Coming soon)

No more drift between your backend implementation and frontend consumption. **If it compiles, it works.**

---

## 📦 Installation

Install the CLI globally or use it via `npx`:

```bash
npm install -g @kcflow/cli

```

Or install it as a dev dependency in your project:

```bash
npm install --save-dev @kcflow/cli
npm install kcflow

```

---

## 🚀 Quick Start

### 1. Initialize Project

Run the init command to create a config file and the initial spec.

```bash
kcflow init

```

This will create `kcflow.config.json` and `kcflow/spec/kcflow.spec.ts`.

### 2. Define your API

Edit `kcflow/spec/kcflow.spec.ts` to describe your resources.

```typescript
import { defineResource, t } from 'kcflow';

export default defineResource({
  users: {
    // GET /users/:id
    get: {
      method: 'GET',
      path: '/users/:id',
      response: t.object({
        id: t.number(),
        name: t.string(),
        email: t.string().optional()
      })
    },
    // POST /users
    create: {
      method: 'POST',
      path: '/users',
      body: t.object({
        name: t.string(),
        email: t.string()
      }),
      response: t.object({ success: t.boolean() })
    }
  }
});

```

### 3. Generate Code

Run the generator to fetch the TypeSafe code from the cloud.

```bash
kcflow gen

```

---

## 💻 Usage

### Frontend (Client)

Use the generated client in your React, Vue, or Angular app. It's fully typed!

```typescript
import { client } from '@/src/kcflow/client';

async function main() {
  // ✅ Autocomplete & Type Checking work here
  const user = await client.users.get({ 
    id: 123 
  });

  console.log(user.name); // Typed as string
}

```

### Backend (Server)

Use the generated router in your Express app. Inputs are validated automatically.

```typescript
import express from 'express';
import { createRouter } from '@/src/kcflow/router';

const app = express();
const router = createRouter(app);

// Implement the logic
router.users.get.create((req, res) => {
  // req.params.id is strictly typed!
  const { id } = req.params; 
  
  // db query...
  res.json({ id: Number(id), name: "KCFlow User" });
});

app.listen(3000);

```

---

## ⚙️ Configuration

The `kcflow.config.json` file handles your project settings. Intellisense is supported via JSON Schema.

```json
{
  "$schema": "[https://api.kcflow.dev/kcflow-schema.json](https://api.kcflow.dev/kcflow-schema.json)",
  "clientType": "axios", 
  "spec": "./kcflow/spec/kcflow.spec.ts",
  "output": {
    "baseDir": "./src/kcflow"
  }
}

```

* **clientType**: `axios` (default) or `fetch`.
* **baseDir**: Where the generated code will be placed.

---

## 🤝 Community & Support

We'd love to hear your feedback!

* **Found a bug?** [Open an Issue](https://github.com/prpag-holding/kcflow/issues)
* **Have a question?** [Start a Discussion](https://github.com/prpag-holding/kcflow/discussions)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

---

<p align="center">
Maintained with ❤️ by <strong>PRPAG HOLDING LTD.</strong>





<a href="https://kcflow.dev">Website</a> • <a href="https://github.com/prpag-holding/kcflow">GitHub</a>
</p>
