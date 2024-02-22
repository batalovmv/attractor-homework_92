import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";


interface InputFieldProps {
    label: string;
    type?: 'text' | 'password' | 'email';
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    autoFocus?: boolean;
    error?: boolean;
    helperText?: string;
    showPassword?: boolean;
    togglePasswordVisibility?: () => void;
}


const InputField: React.FC<InputFieldProps> = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    required = false,
    autoFocus = false,
    error = false,
    helperText = '',
    showPassword = false,
    togglePasswordVisibility,
}) => {
    return (
        <TextField
            margin="normal"
            required={required}
            fullWidth
            label={label}
            name={name}
            id={name}
            autoComplete={name}
            autoFocus={autoFocus}
            error={error}
            helperText={helperText}
            value={value}
            onChange={onChange}
            type={type === 'password' && !showPassword ? 'password' : 'text'}
            InputProps={
                type === 'password'
                    ? {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={togglePasswordVisibility}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }
                    : undefined
            }
        />
    );
};

export default InputField;