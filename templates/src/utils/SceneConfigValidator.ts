import type { SceneData } from '../types.ts';

export interface ValidationError {
  sceneIndex: number;
  field: string;
  message: string;
}

export class SceneConfigValidator {
  validate(scenes: SceneData[]): ValidationError[] {
    const errors: ValidationError[] = [];

    scenes.forEach((scene, index) => {
      // 验证 barChart 格式
      if (scene.barChart !== undefined) {
        if (!Array.isArray(scene.barChart)) {
          errors.push({
            sceneIndex: index,
            field: 'barChart',
            message: 'barChart must be an array of { label: string, value: number } objects',
          });
        } else {
          scene.barChart.forEach((item, itemIndex) => {
            if (typeof item.label !== 'string') {
              errors.push({
                sceneIndex: index,
                field: `barChart[${itemIndex}].label`,
                message: 'barChart item must have a string label',
              });
            }
            if (typeof item.value !== 'number') {
              errors.push({
                sceneIndex: index,
                field: `barChart[${itemIndex}].value`,
                message: 'barChart item must have a number value',
              });
            }
          });
        }
      }

      // 验证图片路径
      if (scene.image && this.hasInvalidPath(scene.image)) {
        errors.push({
          sceneIndex: index,
          field: 'image',
          message: `Image path should not start with 'public/' or '/static-'. Use relative path: ${scene.image}`,
        });
      }

      if (scene.images) {
        scene.images.forEach((img, imgIndex) => {
          if (this.hasInvalidPath(img)) {
            errors.push({
              sceneIndex: index,
              field: `images[${imgIndex}]`,
              message: `Image path should not start with 'public/' or '/static-'. Use relative path: ${img}`,
            });
          }
        });
      }

      // 验证 metrics
      if (scene.metrics) {
        scene.metrics.forEach((metric, metricIndex) => {
          if (typeof metric.value !== 'number') {
            errors.push({
              sceneIndex: index,
              field: `metrics[${metricIndex}].value`,
              message: 'Metric value must be a number',
            });
          }
        });
      }
    });

    return errors;
  }

  private hasInvalidPath(path: string): boolean {
    return path.startsWith('public/') || path.startsWith('/static-');
  }

  validateAndLog(scenes: SceneData[]): boolean {
    const errors = this.validate(scenes);

    if (errors.length > 0) {
      console.error('Scene configuration validation failed:');
      errors.forEach((error) => {
        console.error(
          `  Scene ${error.sceneIndex}: ${error.field} - ${error.message}`
        );
      });
      return false;
    }

    return true;
  }
}
