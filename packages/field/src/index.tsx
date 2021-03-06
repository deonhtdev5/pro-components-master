import React, { useContext } from 'react';
import { Avatar } from 'antd';
import type {
  ProFieldValueType,
  ProFieldValueObjectType,
  BaseProFieldFC,
  ProRenderFieldPropsType,
  ProFieldFCRenderProps,
  ProFieldTextType,
  ProFieldRequestData,
} from '@ant-design/pro-utils';
import { pickProProps, omitUndefined } from '@ant-design/pro-utils';

import ConfigContext, { useIntl } from '@ant-design/pro-provider';
import FieldPercent from './components/Percent';
import FieldIndexColumn from './components/IndexColumn';
import FieldProgress from './components/Progress';
import type { FieldMoneyProps } from './components/Money';
import FieldMoney from './components/Money';
import FieldDatePicker from './components/DatePicker';
import FieldFromNow from './components/FromNow';
import FieldRangePicker from './components/RangePicker';
import FieldCode from './components/Code';
import FieldTimePicker, { FieldTimeRangePicker } from './components/TimePicker';
import FieldText from './components/Text';
import FieldTextArea from './components/TextArea';
import FieldPassword from './components/Password';
import FieldStatus from './components/Status';
import FieldOptions from './components/Options';
import FieldSelect, {
  proFieldParsingText,
  proFieldParsingValueEnumToArray,
} from './components/Select';
import FieldCheckbox from './components/Checkbox';
import FieldRate from './components/Rate';
import FieldSwitch from './components/Switch';
import FieldDigit from './components/Digit';
import FieldSecond from './components/Second';
import FieldRadio from './components/Radio';
import FieldImage from './components/Image';
import FieldCascader from './components/Cascader';
import FieldTreeSelect from './components/TreeSelect';
import FieldColorPicker from './components/ColorPicker';
import FieldDigitRange from './components/DigitRange';
// import type {RangeInputNumberProps,ExtraProps as } from './components/DigitRange'
import { noteOnce } from 'rc-util/lib/warning';

const REQUEST_VALUE_TYPE = ['select', 'radio', 'radioButton', 'checkbook'];

export type ProFieldMoneyProps = FieldMoneyProps;

export type ProFieldEmptyText = string | false;

/** ????????? Field ????????????????????? */
// eslint-disable-next-line @typescript-eslint/ban-types
export type ProFieldFC<T = {}> = React.ForwardRefRenderFunction<
  any,
  BaseProFieldFC & ProRenderFieldPropsType & T
>;

/** Value type by function */
export type ProFieldValueTypeFunction<T> = (item: T) => ProFieldValueType | ProFieldValueObjectType;

type RenderProps = Omit<ProFieldFCRenderProps, 'text'> &
  ProRenderFieldPropsType & {
    /** ???????????????????????? */
    request?: ProFieldRequestData;
    emptyText?: React.ReactNode;
    visible?: boolean;
    onVisible?: (visible: boolean) => void;
    [key: string]: any;
  };

/**
 * Render valueType object
 *
 * @param text String | number
 * @param valueType ProColumnsValueObjectType
 */
const defaultRenderTextByObject = (
  text: ProFieldTextType,
  valueType: ProFieldValueObjectType,
  props: RenderProps,
) => {
  const pickFormItemProps = pickProProps(props.fieldProps);
  if (valueType.type === 'progress') {
    return (
      <FieldProgress
        {...props}
        text={text as number}
        fieldProps={{
          status: valueType.status ? valueType.status : undefined,
          ...pickFormItemProps,
        }}
      />
    );
  }
  if (valueType.type === 'money') {
    return (
      <FieldMoney
        locale={valueType.locale}
        {...props}
        fieldProps={pickFormItemProps}
        text={text as number}
        moneySymbol={valueType.moneySymbol}
      />
    );
  }
  if (valueType.type === 'percent') {
    return (
      <FieldPercent
        {...props}
        text={text as number}
        showSymbol={valueType.showSymbol}
        precision={valueType.precision}
        fieldProps={pickFormItemProps}
        showColor={valueType.showColor}
      />
    );
  }

  if (valueType.type === 'image') {
    return <FieldImage {...props} text={text as string} width={valueType.width} />;
  }
  return text;
};

/**
 * ????????????????????????????????????
 *
 * @param text
 * @param valueType
 */
const defaultRenderText = (
  text: ProFieldTextType,
  valueType: ProFieldValueType | ProFieldValueObjectType,
  props: RenderProps,
  valueTypeMap: Record<string, ProRenderFieldPropsType>,
): React.ReactNode => {
  const { mode = 'read', emptyText = '-' } = props;

  if (emptyText !== false && mode === 'read' && valueType !== 'option' && valueType !== 'switch') {
    if (typeof text !== 'boolean' && typeof text !== 'number' && !text) {
      const { fieldProps, render } = props;
      if (render) {
        return render(text, { mode, ...fieldProps }, <>{emptyText}</>);
      }
      return <>{emptyText}</>;
    }
  }

  // eslint-disable-next-line no-param-reassign
  delete props.emptyText;

  if (typeof valueType === 'object') {
    return defaultRenderTextByObject(text, valueType, props);
  }

  const customValueTypeConfig = valueTypeMap && valueTypeMap[valueType as string];
  if (customValueTypeConfig) {
    // eslint-disable-next-line no-param-reassign
    delete props.ref;
    if (mode === 'read') {
      return customValueTypeConfig.render?.(
        text,
        {
          text,
          ...props,
          mode: mode || 'read',
        },
        <>{text}</>,
      );
    }
    if (mode === 'update' || mode === 'edit') {
      return customValueTypeConfig.renderFormItem?.(
        text,
        {
          text,
          ...props,
        },
        <>{text}</>,
      );
    }
  }

  const needValueEnum = REQUEST_VALUE_TYPE.includes(valueType as string);
  const hasValueEnum = !!(
    props.valueEnum ||
    props.request ||
    props.options ||
    props.fieldProps?.options
  );

  noteOnce(
    !needValueEnum || hasValueEnum,
    `??????????????? valueType ??? ${REQUEST_VALUE_TYPE.join(
      ',',
    )}?????????????????????????????????options???request, valueEnum ??????????????????????????????????????????`,
  );

  noteOnce(
    !needValueEnum || hasValueEnum,
    `If you set valueType to any of ${REQUEST_VALUE_TYPE.join(
      ',',
    )}, you need to configure options, request or valueEnum.`,
  );

  /** ????????????????????? */
  if (valueType === 'money') {
    return <FieldMoney {...props} text={text as number} />;
  }

  /** ????????????????????? */
  if (valueType === 'date') {
    return <FieldDatePicker text={text as string} format="YYYY-MM-DD" {...props} />;
  }

  /** ?????????????????? */
  if (valueType === 'dateWeek') {
    return <FieldDatePicker text={text as string} format="YYYY-wo" picker="week" {...props} />;
  }

  /** ?????????????????? */
  if (valueType === 'dateMonth') {
    return <FieldDatePicker text={text as string} format="YYYY-MM" picker="month" {...props} />;
  }

  /** ????????????????????? */
  if (valueType === 'dateQuarter') {
    return <FieldDatePicker text={text as string} format="YYYY-\QQ" picker="quarter" {...props} />;
  }

  /** ?????????????????? */
  if (valueType === 'dateYear') {
    return <FieldDatePicker text={text as string} format="YYYY" picker="year" {...props} />;
  }

  /** ??????????????????????????? */
  if (valueType === 'dateRange') {
    return <FieldRangePicker text={text as string[]} format="YYYY-MM-DD" {...props} />;
  }

  /** ???????????????????????????????????? */
  if (valueType === 'dateTime') {
    return (
      <FieldDatePicker text={text as string} format="YYYY-MM-DD HH:mm:ss" showTime {...props} />
    );
  }

  /** ?????????????????????????????????????????? */
  if (valueType === 'dateTimeRange') {
    // ??????????????????????????? "-"
    return (
      <FieldRangePicker text={text as string[]} format="YYYY-MM-DD HH:mm:ss" showTime {...props} />
    );
  }

  /** ??????????????????????????? */
  if (valueType === 'time') {
    return <FieldTimePicker text={text as string} format="HH:mm:ss" {...props} />;
  }

  /** ??????????????????????????? */
  if (valueType === 'timeRange') {
    return <FieldTimeRangePicker text={text as string[]} format="HH:mm:ss" {...props} />;
  }

  if (valueType === 'fromNow') {
    return <FieldFromNow text={text as string} {...props} />;
  }

  if (valueType === 'index') {
    return <FieldIndexColumn>{(text as number) + 1}</FieldIndexColumn>;
  }

  if (valueType === 'indexBorder') {
    return <FieldIndexColumn border>{(text as number) + 1}</FieldIndexColumn>;
  }

  if (valueType === 'progress') {
    return <FieldProgress {...props} text={text as number} />;
  }
  /** ?????????, ??????????????????, ?????????????????? */
  if (valueType === 'percent') {
    return <FieldPercent text={text as number} {...props} />;
  }

  if (valueType === 'avatar' && typeof text === 'string' && props.mode === 'read') {
    return <Avatar src={text as string} size={22} shape="circle" />;
  }

  if (valueType === 'code') {
    return <FieldCode text={text as string} {...props} />;
  }

  if (valueType === 'jsonCode') {
    return <FieldCode text={text as string} language="json" {...props} />;
  }

  if (valueType === 'textarea') {
    return <FieldTextArea text={text as string} {...props} />;
  }

  if (valueType === 'digit') {
    return <FieldDigit text={text as number} {...props} />;
  }

  if (valueType === 'digitRange') {
    return <FieldDigitRange text={text as number[]} {...props} />;
  }

  if (valueType === 'second') {
    return <FieldSecond text={text as number} {...props} />;
  }

  if (valueType === 'select' || (valueType === 'text' && (props.valueEnum || props.request))) {
    return <FieldSelect text={text as string} {...props} />;
  }

  if (valueType === 'checkbox') {
    return <FieldCheckbox text={text as string} {...props} />;
  }

  if (valueType === 'radio') {
    return <FieldRadio text={text as string} {...props} />;
  }

  if (valueType === 'radioButton') {
    return <FieldRadio radioType="button" text={text as string} {...props} />;
  }

  if (valueType === 'rate') {
    return <FieldRate text={text as string} {...props} />;
  }
  if (valueType === 'switch') {
    return <FieldSwitch text={text as boolean} {...props} />;
  }

  if (valueType === 'option') {
    return <FieldOptions text={text} {...props} />;
  }

  if (valueType === 'password') {
    return <FieldPassword text={text as string} {...props} />;
  }

  if (valueType === 'image') {
    return <FieldImage text={text as string} {...props} />;
  }
  if (valueType === 'cascader') {
    return <FieldCascader text={text as string} {...props} />;
  }

  if (valueType === 'treeSelect') {
    return <FieldTreeSelect text={text as string} {...props} />;
  }

  if (valueType === 'color') {
    return <FieldColorPicker text={text as string} {...props} />;
  }

  return <FieldText text={text as string} {...props} />;
};

export { defaultRenderText };

/** ProField ????????? */
export type ProFieldPropsType = {
  text?: ProFieldTextType;
  valueType?: ProFieldValueType | ProFieldValueObjectType;
} & RenderProps;

const ProField: React.ForwardRefRenderFunction<any, ProFieldPropsType> = (
  { text, valueType = 'text', mode = 'read', onChange, renderFormItem, value, readonly, ...rest },
  ref: any,
) => {
  const intl = useIntl();
  const context = useContext(ConfigContext);

  const fieldProps = (value !== undefined || onChange || rest?.fieldProps) && {
    value,
    // fieldProps ??????????????????????????? LightFilter ?????????????????????????????? value ??? onChange
    ...omitUndefined(rest?.fieldProps),
    onChange: (...restParams: any[]) => {
      rest?.fieldProps?.onChange?.(...restParams);
      onChange?.(...restParams);
    },
  };

  return (
    <React.Fragment>
      {defaultRenderText(
        mode === 'edit' ? fieldProps?.value ?? text ?? '' : text ?? fieldProps?.value ?? '',
        valueType || 'text',
        {
          ref,
          ...rest,
          mode: readonly ? 'read' : mode,
          renderFormItem: renderFormItem
            ? (...restProps) => {
                const newDom = renderFormItem(...restProps);
                // renderFormItem ?????????dom????????????props??????????????????????????????
                if (React.isValidElement(newDom))
                  return React.cloneElement(newDom, {
                    placeholder:
                      rest.placeholder || intl.getMessage('tableForm.inputPlaceholder', '?????????'),
                    ...fieldProps,
                    ...((newDom.props as any) || {}),
                  });
                return newDom;
              }
            : undefined,
          placeholder: rest.placeholder || intl.getMessage('tableForm.inputPlaceholder', '?????????'),
          fieldProps: pickProProps(fieldProps),
        },
        context.valueTypeMap,
      )}
    </React.Fragment>
  );
};

export {
  FieldPercent,
  FieldIndexColumn,
  FieldProgress,
  FieldMoney,
  FieldDatePicker,
  FieldRangePicker,
  FieldCode,
  FieldTimePicker,
  FieldText,
  FieldStatus,
  FieldSelect,
  proFieldParsingText,
  proFieldParsingValueEnumToArray,
};

export type { ProFieldValueType, FieldMoneyProps };

export default React.forwardRef(ProField) as typeof ProField;
