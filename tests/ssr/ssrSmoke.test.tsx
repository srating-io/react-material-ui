import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '../../src/contexts/themeContext.tsx';
import {
  Button,
  IconButton,
  Tab,
  Paper,
  Chip,
  Slab,
  Tile,
  Modal,
  Drawer,
  Plane,
  Toast,
  Tooltip,
  Menu,
  TextInput,
  Textarea,
  Select,
  DateInput,
  Switch,
  MultiPicker,
  Calendar,
  Table,
  VirtualTable,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Backdrop,
  Columns,
  Wizard,
  Typography,
  Divider,
  CodeBlock,
  Inputs,
  UXBaseline,
} from '../../src/index.ts';

const renderSSR = (ui: React.ReactElement) => {
  return renderToString(
    <ThemeProvider theme="dark">
      {ui}
    </ThemeProvider>
  );
};

describe('SSR Smoke Suite', () => {
  it('renders all buttons and containers without SSR error', () => {
    expect(() => renderSSR(<Button title="SSR" value="1" onClick={() => {}} />)).not.toThrow();
    expect(() => renderSSR(<IconButton icon={<span>*</span>} value="1" onClick={() => {}} />)).not.toThrow();
    expect(() => renderSSR(<Tab title="Tab" value="1" selected onClick={() => {}} />)).not.toThrow();
    expect(() => renderSSR(<Paper transparency={0.5} hover>Paper</Paper>)).not.toThrow();
    expect(() => renderSSR(<Chip title="Chip" value="1" onDelete={() => {}} />)).not.toThrow();
    expect(() => renderSSR(<Slab>Slab</Slab>)).not.toThrow();
    expect(() => renderSSR(<Tile title="Tile" />)).not.toThrow();
  });

  it('renders overlays safely during SSR without window/document crashes', () => {
    expect(() => renderSSR(<Modal open={true} onClose={() => {}}>Modal</Modal>)).not.toThrow();
    expect(() => renderSSR(<Drawer open={true} onClose={() => {}}>Drawer</Drawer>)).not.toThrow();
    expect(() => renderSSR(<Plane open={true} onClose={() => {}} anchor={null}>Plane</Plane>)).not.toThrow();
    expect(() => renderSSR(<Toast />)).not.toThrow();
    expect(() => renderSSR(<Tooltip text="Tip"><button>Btn</button></Tooltip>)).not.toThrow();
    expect(() => renderSSR(<Menu open={true} options={[{ value: '1', selectable: true, label: 'One' }]} anchor={null} onClose={() => {}} />)).not.toThrow();
  });

  it('renders input components during SSR', () => {
    expect(() => renderSSR(<TextInput placeholder="Type" />)).not.toThrow();
    expect(() => renderSSR(<Textarea placeholder="Area" />)).not.toThrow();
    expect(() => renderSSR(<Select options={[{ value: '1', label: 'One' }]} value="1" />)).not.toThrow();
    expect(() => renderSSR(<DateInput value="2026-10-09" />)).not.toThrow();
    expect(() => renderSSR(<Switch checked={true} onChange={() => {}} />)).not.toThrow();
    expect(() => renderSSR(<Calendar value="2026-10-09" onChange={() => {}} />)).not.toThrow();
    expect(() => renderSSR(
      <MultiPicker
        inputHandler={new Inputs()}
        options={[{ label: 'A', value: 'a' }]}
        selected={['a']}
      />
    )).not.toThrow();
  });

  it('renders tables and complex components during SSR', () => {
    const sampleColumn = {
      id: 'name',
      numeric: false,
      organization_ids: [],
      graphable: false,
      getLabel: () => 'Name',
      getTooltip: () => 'Name column',
      getViews: () => [],
    };

    expect(() => renderSSR(
      <VirtualTable
        rows={[{ id: '1', name: 'Test' }]}
        columns={{ name: sampleColumn }}
        displayColumns={['name']}
        rowKey="id"
        sessionStorageKey="ssr_test_key"
      />
    )).not.toThrow();

    expect(() => renderSSR(
      <Wizard
        steps={[
          { id: '1', title: 'Step 1', isValid: () => true, content: <div>S1</div> },
        ]}
      />
    )).not.toThrow();

    expect(() => renderSSR(<Columns numberOfColumns={2}><div>1</div><div>2</div></Columns>)).not.toThrow();
    expect(() => renderSSR(<CircularProgress />)).not.toThrow();
    expect(() => renderSSR(<LinearProgress />)).not.toThrow();
    expect(() => renderSSR(<Skeleton />)).not.toThrow();
    expect(() => renderSSR(<Backdrop open={false} />)).not.toThrow();
    expect(() => renderSSR(<Typography type="h1">Heading</Typography>)).not.toThrow();
    expect(() => renderSSR(<Divider />)).not.toThrow();
    expect(() => renderSSR(<CodeBlock code="console.log('hi');" language="javascript" />)).not.toThrow();
    expect(() => renderSSR(<UXBaseline />)).not.toThrow();
  });
});
