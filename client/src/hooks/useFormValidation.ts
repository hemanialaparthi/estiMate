import { useState, useCallback } from 'react';

export interface FormField {
    value: string;
    error?: string;
    touched?: boolean;
    isValid?: boolean;
}

export interface FormValidationRules {
    [key: string]: {
        validate: (value: string) => string | null;
        async?: (value: string) => Promise<string | null>;
    };
}

export function useFormValidation<T extends Record<string, FormField>>(
    initialValues: T,
    rules?: FormValidationRules
) {
    const [fields, setFields] = useState<T>(initialValues);
    const [isTouched, setIsTouched] = useState<Record<string, boolean>>({});

    const validate = useCallback(
        (fieldName: string, value: string): string | null => {
            if (!rules || !rules[fieldName]) return null;

            const rule = rules[fieldName];
            const error = rule.validate(value);
            return error;
        },
        [rules]
    );

    const setFieldValue = useCallback(
        (fieldName: string, value: string) => {
            const error = validate(fieldName, value);
            setFields((prev) => ({
                ...prev,
                [fieldName]: {
                    ...prev[fieldName],
                    value,
                    error,
                    isValid: !error,
                },
            }));
        },
        [validate]
    );

    const setFieldTouched = useCallback((fieldName: string) => {
        setIsTouched((prev) => ({ ...prev, [fieldName]: true }));
    }, []);

    const isFormValid = useCallback(() => {
        return Object.values(fields).every((field) => !field.error && field.value);
    }, [fields]);

    const getFieldProps = useCallback(
        (fieldName: string) => ({
            value: fields[fieldName]?.value || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                setFieldValue(fieldName, e.target.value),
            onBlur: () => setFieldTouched(fieldName),
            onFocus: () => setFieldTouched(fieldName),
        }),
        [fields, setFieldValue, setFieldTouched]
    );

    const getFieldState = useCallback(
        (fieldName: string) => {
            const field = fields[fieldName];
            const shouldShowError = isTouched[fieldName] && field?.error;
            return {
                error: shouldShowError ? field?.error : null,
                isValid: field?.isValid,
                isTouched: isTouched[fieldName],
            };
        },
        [fields, isTouched]
    );

    const resetForm = useCallback(() => {
        setFields(initialValues);
        setIsTouched({});
    }, [initialValues]);

    return {
        fields,
        setFieldValue,
        setFieldTouched,
        getFieldProps,
        getFieldState,
        isFormValid,
        resetForm,
        values: Object.fromEntries(
            Object.entries(fields).map(([key, field]) => [key, field.value])
        ) as Record<string, string>,
    };
}
