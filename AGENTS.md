# AGENTS

## Package Manager

Always use **pnpm** (version 11.4.0) for all package management operations. Do not use npm or yarn.

```bash
pnpm <command>
```

### Instalar dependencias

```bash
pnpm install
```

### Agregar dependencias

```bash
pnpm add <package>
pnpm add -D <package>  # devDependency
```

### Scripts

```bash
pnpm dev       # Iniciar servidor de desarrollo
pnpm build     # Compilar para producción
pnpm lint      # Ejecutar ESLint
pnpm preview   # Previsualizar build de producción
```
