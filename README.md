# react-material-ui

Material UI components for React.


## Documentation

Documentation examples can be found at [ux.srating.io](https://ux.srating.io).

## Overview

`react-material-ui` is a collection of reusable, accessible, and highly customizable UI components designed to follow Material Design principles. It provides a set of ready-to-use components for building modern web applications with ease.

## Components

The library includes a wide variety of components categorized as follows:

### 🔘 Buttons
- Button
- IconButton
- Tab

### 📦 Containers & Layout
- Chip
- Paper
- Slab
- Tile
- Columns
- Wizard

### ⌨️ Inputs
- TextInput
- Textarea
- Select
- Switch
- Date Input
- MultiPicker

### 📋 Tables
- Table
- VirtualTable (Performant large dataset rendering)
- Table Components (Thead, Tbody, Tfoot, Tr, Th, Td)

### ⏳ Loading & Overlays
- CircularProgress
- LinearProgress
- Skeleton
- Backdrop
- Tooltip
- Drawer
- Toast
- Plane
- Modal (including ErrorModal)

### 📜 Text & Display
- Typography
- CodeBlock
- Divider

### 🍔 Menu
- Menu
- MenuItem
- MenuList (Text and Icon variants)

### 🗓️ Other
- Calendar
- UXBaseline

## Installation

You can install the package via npm:

```bash
npm install @esmalley/react-material-ui
```

*Note: Ensure you have `react` and `react-dom` (v19+) installed as peer dependencies.*

## Building from Source

If you want to build the library yourself, you can use the provided build script:

```bash
npm run build
```

This process uses `esbuild` to generate both ESM and CJS bundles.


## Working on this project
This is indended to be worked on in tandum with [react-material-ui-docs](https://github.com/srating-io/react-material-ui-docs). The docs page will be the place to test and develop new feature for this package.

Assuming both repo are installed and set up, to link them and develop do this:

In `react-material-ui`
```bash
npm link
```

In `react-material-ui-docs`
```bash
npm link @esmalley/react-material-ui
```

In `react-material-ui`
```bash
npm run watch
```

In `react-material-ui-docs`
```bash
npm run dev
```

The application will be available at [http://localhost:3002](http://localhost:3002).

## License

This project is licensed under the Apache-2.0 License.


