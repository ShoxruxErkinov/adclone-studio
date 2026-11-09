import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { AdComposition } from './AdComposition';
import { createDraft, videoDuration } from '../lib/model';
const Root = () => <Composition id="AdClone" component={AdComposition} width={1080} height={1920} fps={30} durationInFrames={450} defaultProps={{project:createDraft()}} calculateMetadata={({props})=>({durationInFrames:videoDuration(props.project)*30})}/>;
registerRoot(Root);
