// src/Root.tsx - 视频根组件（重构版）

import React from "react";
import {
  Composition,
  AbsoluteFill,
  staticFile,
  Audio,
} from "remotion";
import {
  TransitionSeries,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { BackgroundMusic } from "./components/BackgroundMusic";
import { AudioWaveform } from "./components/AudioWaveform";
import type { SceneData } from "./types";

// 导入配置文件
import scenesDataRaw from "../scenes.json";
import timingDataRaw from "../public/audio/timing.json";

const FPS = 30;
const TRANSITION_FRAMES = 15; // 过渡 15 帧 (0.5s)

// 导入场景组件
import { Scene01 } from "./scenes/Scene01";
import { Scene02 } from "./scenes/Scene02";
import { Scene03 } from "./scenes/Scene03";
import { Scene04 } from "./scenes/Scene04";
import { Scene05 } from "./scenes/Scene05";

// 场景组件映射
const sceneComponents: Record<string, React.FC<any>> = {
  intro: Scene01,
  slideshow: Scene02,
  subtitle: Scene03,
  dashboard: Scene04,
  outro: Scene05,
};

// 场景类型列表（顺序）
const SCENE_TYPES = ["intro", "slideshow", "subtitle", "dashboard", "outro"];

// Timing 数据类型
interface TimingSection {
  name: string;
  start_frame: number;
  end_frame: number;
  duration_frames: number;
  label: string;
  sentences: Array<{
    text: string;
    start_frame: number;
    end_frame: number;
  }>;
}

interface TimingData {
  fps: number;
  total_frames: number;
  total_duration_sec: number;
  sections: TimingSection[];
}

// 计算总帧数（扣除过渡重叠）
const calculateTotalFrames = (
  sections: TimingSection[]
): number => {
  const totalDuration = sections.reduce((sum, s) => sum + s.duration_frames, 0);
  const transitionOverlap = Math.max(0, sections.length - 1) * TRANSITION_FRAMES;
  return totalDuration - transitionOverlap;
};

// 场景项类型
interface EnabledSceneItem {
  scene: SceneData;
  type: string;
  index: number;
  timing: TimingSection;
}

// 视频组件 Props
interface NewsVideoProps {
  enabledScenes: EnabledSceneItem[];
  totalFrames: number;
}

// 主视频组件
interface NewsVideoFullProps extends NewsVideoProps {
  hasBackgroundMusic?: boolean;
}

const NewsVideo: React.FC<NewsVideoFullProps> = ({
  enabledScenes,
  totalFrames,
  hasBackgroundMusic = false,
}) => {
  return (
    <AbsoluteFill>
      {/* 背景音乐（仅在 public/audio/background.mp3 存在时启用） */}
      {hasBackgroundMusic && (
        <BackgroundMusic
          src="audio/background.mp3"
          videoDurationInFrames={totalFrames}
          volume={0.2}
        />
      )}

      {/* 音频波形可视化 */}
      <AudioWaveform
        mode="bars"
        position="bottom"
        barCount={32}
        height={40}
        opacity={0.2}
        color="#e94560"
        animated={true}
      />

      {/* 场景序列（带过渡） */}
      <TransitionSeries>
        {enabledScenes.map(({ scene, type, index, timing }, arrayIndex) => {
          const SceneComponent = sceneComponents[type];
          const duration = timing.duration_frames;
          const audioSrc = `audio/scene_0${index + 1}.mp3`;

          return (
            <React.Fragment key={index}>
              <TransitionSeries.Sequence durationInFrames={duration}>
                <SceneComponent
                  sceneData={scene}
                  durationInFrames={duration}
                  timing={timing}
                />
                {/* 场景配音 */}
                <Audio src={staticFile(audioSrc)} volume={1} />
              </TransitionSeries.Sequence>

              {/* 添加过渡（最后一个场景后不需要） */}
              {arrayIndex < enabledScenes.length - 1 && (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  // 断言类型
  const scenesData = scenesDataRaw as { scenes: SceneData[] };
  const timingData = timingDataRaw as TimingData;

  const { scenes } = scenesData;
  const { sections } = timingData;

  // 匹配场景和时序数据（按 type/label 匹配，而非索引）
  const enabledScenes: EnabledSceneItem[] = scenes
    .map((scene, index) => {
      const type = scene.type as string;
      // 优先按 scene.id 匹配 timing section name，再按 type 匹配 label
      const timing = sections.find(s => s.name === scene.id)
        || sections.find(s => s.label === type);

      if (!timing || !scene.enabled) return null;

      return { scene, type, index, timing };
    })
    .filter((item): item is EnabledSceneItem => item !== null);

  // 如果没有启用的场景
  if (enabledScenes.length === 0) {
    console.error("No enabled scenes found!");
    return (
      <Composition
        id="NewsVideo"
        component={() => (
          <AbsoluteFill>
            <div style={{ color: "white", fontSize: 48 }}>No scenes enabled</div>
          </AbsoluteFill>
        )}
        durationInFrames={FPS * 60}
        fps={FPS}
        width={1080}
        height={1920}
      />
    );
  }

  // 计算总帧数
  const totalFrames = calculateTotalFrames(enabledScenes.map(s => s.timing));

  // 从 scenes.json 读取背景音乐配置
  const bgmConfig = (scenesData as any).backgroundMusic;
  const hasBackgroundMusic = bgmConfig !== false && bgmConfig !== undefined;

  // 准备默认 props
  const defaultProps: NewsVideoFullProps = {
    enabledScenes,
    totalFrames,
    hasBackgroundMusic,
  };

  return (
    <>
      <Composition
        id="NewsVideo"
        component={NewsVideo as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={totalFrames}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultProps as unknown as Record<string, unknown>}
      />
    </>
  );
};
