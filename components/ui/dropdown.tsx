'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useWebSocket } from '@/services/socket/WebSocketContext';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Controller, ControllerRenderProps, FieldValues } from 'react-hook-form';
import Select, { ActionMeta, MultiValue, SingleValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';

interface Option {
    value: string | number;
    label: string | number;
    key: string;
}

interface DropdownProps {
    label?: string | number;
    options?: Option[] | any[];
    value?: string | number | (string | number)[];
    onChange?: (value: string | number | (string | number)[]) => void;
    name?: string;
    onSelect?: (value: string | number | any | (string | number)[] | any) => void;
    className?: string;
    errors?: any;
    requestPayload?: any;
    required?: boolean;
    defaultValue?: string;
    multiselect?: boolean;
    disabled?: boolean;
    formClassName?: string;
    placeholder?: string;
    labelClassName?: string;
    payload?: any;
    children?: any;
    control: any;
    rules?: any;
    isCreatable?: boolean;
    isClearable?: boolean;
    isHideDropdonw?: boolean;
    inline?: boolean;
    menuIsOpen?: boolean;
    fontWeight?: string;
    name_key?: string;
    setValue?: any;
    theme?: 'secondary';
    errorclassname?: any;
    isLabelRight?: boolean;
    setStatekay?: Dispatch<SetStateAction<string>>;
    onInputChange?: (value: string) => void;
    noOptionsPlaceholder?: string;
    isRounded?: boolean;
}

const DropdownSelect: React.FC<DropdownProps> = ({
    errors,
    requestPayload,
    label,
    options,
    onChange,
    name,
    onSelect,
    className,
    required,
    defaultValue,
    payload,
    multiselect = false,
    disabled = false,
    control,
    rules,
    isCreatable = false,
    isClearable = false,
    menuIsOpen = false,
    formClassName = '',
    placeholder = '',
    labelClassName = '',
    fontWeight = 'medium',
    name_key = '',
    noOptionsPlaceholder = 'No options',
    setValue,
    inline,
    value = '',
    setStatekay,
    theme = "",
    isLabelRight = false,
    errorclassname,
    onInputChange: parentOnInputChange,
    isRounded = false
}) => {
    const [searchInput, setSearchInput] = useState(payload?.payload?.query || '');
    const [dropdownOptions, setDropdownOptions] = useState<Option[]>(
        options || [],
    );
    const { sendMessage } = useWebSocket();
    const [readonly, setReadonly] = useState(true);
    useEffect(() => {
        setDropdownOptions((options ?? []) as Option[]);
    }, [options]);

    const handleSelectChange = (
        selectedOption: SingleValue<Option> | MultiValue<Option> | any,
        actionMeta: ActionMeta<Option>,
        field: any,
    ) => {
        const value: any = multiselect
            ? (selectedOption as MultiValue<Option>)?.map((option) => option.value)
            : (selectedOption as SingleValue<Option>)?.value;
        const Keyvalue = (selectedOption as SingleValue<Option>)?.key;

        field.onChange(value ?? null);
        if (!multiselect) {
            if (name_key && setValue && selectedOption?.label && !multiselect) {
                setValue(name_key, selectedOption?.label);
            }
        }

        if (onChange) {
            onChange(value);
        }
        if (onSelect) {
            onSelect({ ...selectedOption, value, name });
        }

        setSearchInput('');
        if (Keyvalue && setStatekay) {
            setStatekay(Keyvalue);
        }
    };

    const handleInputChange = (inputValue: string, field: any, actionMeta: any) => {
        setSearchInput(inputValue);
        if (parentOnInputChange) {
            parentOnInputChange(inputValue);
        }

        const selectedValue = getValue(field);
        if (requestPayload && inputValue) {
            requestPayload.payload.query = inputValue;
            sendMessage(requestPayload);
        } else {
            if (!selectedValue?.value) {
                // requestPayload.payload.query = inputValue;
                // send(requestPayload);
            }
        }
    };
    const themes: any = {
        secondary: {
            indicator: `bg-[#F0F0F0] h-auto right-[-1px] rounded-r-md relative`,
            dropdownIndicator: `border-l border-l-table`,
            control: '!py-0',
        },
    };
    const classNames = {
        indicatorsContainer: (props: any) => `${themes?.[theme]?.indicator}`,
        control: (props: any) =>
            ` overflow-auto transition-colors hover:bg-accent ${isLabelRight && 'h-[56px]'} ${themes?.[theme]?.control} ${errors ? '!border !border-red-600' : ''
            }`,
        dropdownIndicator: (props: any) => `${themes?.[theme]?.dropdownIndicator}`,
    };

    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isDisabled ? '#fdfcfb' : '#fffff',
            padding: '0.08rem',
            minHeight: "42px",
            border: 'none',
            boxShadow: 'none',
            borderRadius: "5px",
        }),
        menu: (provided: any) => ({
            ...provided,
            borderRadius: '10px',
            overflow: 'hidden',
            zIndex: 9999,
        }),
        menuPortal: (provided: any) => ({
            ...provided,
            zIndex: 9999,
        }),
        option: (provided: any) => ({
            ...provided,
            padding: '10px',
        }),
        placeholder: (provided: any) => ({
            ...provided,
            marginLeft: 0,
            marginRight: 0,
            padding: '0px 2px 0px 2px',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '10px',
        }),
        '&:hover': {
            border: 'none',
        },
    };

    const getValue = (field: any) => {
        if (isCreatable) {
            if (multiselect) {
                if (field?.value) {
                    return (
                        options?.filter((option) =>
                            (field?.value as (string | number)[]).includes(option.value),
                        ) || field?.value?.map((value: any) => ({ label: value, value }))
                    );
                } else {
                    return null;
                }
            } else {
                const checkDetails = options?.find?.(
                    (option) => option?.value === field?.value,
                );
                return checkDetails || { label: field?.value, value: field?.value };
            }
        } else {
            if (multiselect) {
                return options?.filter((option) =>
                    (field.value as (string | number)[]).includes(option?.value),
                );
            } else {
                const checkDetails = options?.find?.(
                    (option) => option?.value === field?.value,
                );
                return checkDetails || null;
            }
        }
    };

    const callOnFocus = () => {
        setReadonly(false);
    };

    const callOnBlur = () => {
        setReadonly(true);
    };

    const RenderSelect = ({
        field,
    }: {
        field: ControllerRenderProps<FieldValues, string>;
    }) => {
        const selectedValue = getValue(field);
        return (
            <div className="flex flex-col">
                <div className="w-full h-full">
                    {isCreatable ? (
                        <CreatableSelect
                            classNamePrefix="select-form"
                            isDisabled={disabled}
                            value={selectedValue}
                            onChange={(selectedOption, actionMeta) =>
                                handleSelectChange(selectedOption, actionMeta, field)
                            }
                            styles={customStyles}
                            options={dropdownOptions}
                            onInputChange={(e, actionMeta) =>
                                handleInputChange(e, field, actionMeta)
                            }
                            placeholder={
                                placeholder || (defaultValue ? `Select ${defaultValue}` : '')
                            }
                            noOptionsMessage={() => noOptionsPlaceholder}
                            className={`${className} text-sm select-form-containers `}
                            onFocus={callOnFocus}
                            onBlur={callOnBlur}
                            inputValue={searchInput}
                            isSearchable
                            components={{ IndicatorSeparator: null }}
                            menuShouldScrollIntoView={false}
                            menuPosition="fixed"
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            classNames={classNames}
                        />
                    ) : (
                        <Select
                            classNamePrefix="select-form"
                            isDisabled={disabled}
                            isMulti={multiselect}
                            value={selectedValue}
                            classNames={classNames}
                            onChange={(selectedOption, actionMeta) =>
                                handleSelectChange(selectedOption, actionMeta, field)
                            }
                            styles={customStyles}
                            options={dropdownOptions}
                            onInputChange={(e, actionMeta) =>
                                handleInputChange(e, field, actionMeta)
                            }
                            placeholder={
                                placeholder || (defaultValue ? `Select ${defaultValue}` : '')
                            }
                            noOptionsMessage={() => noOptionsPlaceholder}
                            className={`${className} text-sm select-form-containers bg-white shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20`}
                            onFocus={callOnFocus}
                            onBlur={callOnBlur}
                            inputValue={searchInput}
                            components={{ IndicatorSeparator: null }}
                            isSearchable
                            menuShouldScrollIntoView={false}
                            menuPosition="fixed"
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            isClearable={isClearable}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`${isLabelRight && 'flex flex-col px-2  mt-2'}`}>
            {label && isLabelRight && (
                <label className="mb-1 text-[14px]">
                    {label} {required && <span className="text-red-500"> *</span>}
                </label>
            )}
            {label && !isLabelRight && (
                <label
                    className={`text-sm font-medium ${labelClassName}`}
                    htmlFor={name}
                >
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
            )}
            <div
                className={`flex  ${inline ? 'items-center space-x-2' : 'flex flex-col'}  ${formClassName} mt-1 h-11 rounded-[10px] border-input border-[1px] ${isRounded ? 'rounded-full' : ' rounded-md'}   overflow-hidden ${errors ? 'border-red-600' : `focus-within:border-[#C8C9C9] border-[#C8C9C9]`}`}
            >
                <Controller
                    name={name!}
                    control={control}
                    rules={rules}
                    defaultValue={value}
                    render={RenderSelect}
                />
            </div>
            {errors && (
                <div className={`flex items-center mt-1 ${errorclassname}`}>
                    <p className="text-xs mx-1 text-red-600 text-left">
                        {errors.message}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DropdownSelect;
