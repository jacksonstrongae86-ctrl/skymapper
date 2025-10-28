import { renderToString } from 'react-dom/server';
import AirspaceTooltip from './AirspaceTooltip';
import { Airspace } from '@/src/utils/types';
import { AirspaceColorConfig } from '@/src/utils/airspaceColors';
import { AltitudeUnit } from '@/src/utils/unitConversions';

interface AirspaceTooltipContentProps {
  airspace: Airspace;
  colorConfig: AirspaceColorConfig;
  altitudeUnit: AltitudeUnit;
}

export const createAirspaceTooltipContent = ({
  airspace,
  colorConfig,
  altitudeUnit,
}: AirspaceTooltipContentProps): string => {
  return renderToString(
    <AirspaceTooltip
      airspace={airspace}
      colorConfig={colorConfig}
      altitudeUnit={altitudeUnit}
    />
  );
};

export default createAirspaceTooltipContent;