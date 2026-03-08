

# Reduce ThemeSwitch Toggle Size

## Change
Single edit in `src/components/ui/theme-switch.css` — change `--toggle-size` from `30px` to `14px`.

This one variable controls the entire component since all dimensions use `em` units derived from the font-size set by `--toggle-size`. Halving it scales everything proportionally: container, sun/moon circle, clouds, stars, spots.

### File: `src/components/ui/theme-switch.css` (line 2)
```css
/* Before */
--toggle-size: 30px;

/* After */
--toggle-size: 14px;
```

