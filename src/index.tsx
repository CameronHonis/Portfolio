import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {App} from './App';

import posthog from "posthog-js";
import {PostHogEvent} from "./models/PostHogEvents";

posthog.init('phc_VbKnqLMfLYOMETXlZ0gJxCp9ubs9jWfuawo33PZLLCJ', {api_host: 'https://us.i.posthog.com'})

posthog.capture(PostHogEvent.PAGE_INIT);
ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
