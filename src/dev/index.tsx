import React from 'react';
import ReactDOM from 'react-dom/client';
import { StoryBox } from 'storybox-react';
import 'storybox-react/dist/styles.css';
import '../lib/index.scss';
import './index.scss';

import { stories } from './stories';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<StoryBox stories={stories} />);
