"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { AVAILABLE_LANGUAGES, Language } from "@/locales";
import LanguageIcon from "@mui/icons-material/Language";
import {
    Box,
    FormControl,
    IconButton,
    InputLabel,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Select,
} from "@mui/material";
import React from "react";

interface LanguageSwitcherProps {
    variant?: "select" | "menu";
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
    variant = "select" 
}) => {
    const { currentLanguage, changeLanguage } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageChange = (language: Language) => {
        changeLanguage(language);
        if (variant === "menu") {
            handleMenuClose();
        }
    };

    if (variant === "menu") {
        return (
            <Box>
                <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    color="inherit"
                    title="언어 변경"
                >
                    <LanguageIcon />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                >
                    {AVAILABLE_LANGUAGES.map((lang) => (
                        <MenuItem
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code as Language)}
                            selected={currentLanguage === lang.code}
                        >
                            <ListItemIcon>
                                <LanguageIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>
                                {lang.name}
                            </ListItemText>
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
        );
    }

    return (
        <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="language-select-label">언어</InputLabel>
            <Select
                labelId="language-select-label"
                value={currentLanguage}
                label="언어"
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
            >
                {AVAILABLE_LANGUAGES.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}; 