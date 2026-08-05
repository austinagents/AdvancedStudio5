import {g2Designs} from "../antv-studio/definitions/g2-designs";

export type AdvancedStudioG2Template = {
  id: string;
  label: string;
  category: string;
  description: string;
  animation: string;
};

export const advancedStudioG2Templates: AdvancedStudioG2Template[] =
  g2Designs.map((design) => ({
    id: design.id,
    label: design.name,
    category: design.category,
    description: design.description,
    animation: design.animation,
  }));

export const getAdvancedStudioG2Template = (id: string | undefined) =>
  advancedStudioG2Templates.find((template) => template.id === id);
