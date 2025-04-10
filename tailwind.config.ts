/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
        extend: {
            typography: () => ({
                flexoki: {
                    css: {
                        // Light mode
                        '--tw-prose-body': 'var(--color-flexoki-light-tx)',
                        '--tw-prose-headings': 'var(--color-flexoki-light-tx)',
                        '--tw-prose-lead': 'var(--color-flexoki-base-600)',
                        '--tw-prose-links': 'var(--color-flexoki-light-cy)',
                        '--tw-prose-bold': 'var(--color-flexoki-light-tx)',
                        '--tw-prose-counters': 'var(--color-flexoki-light-tx-2)',
                        '--tw-prose-bullets': 'var(--color-flexoki-light-tx-3)',
                        '--tw-prose-hr': 'var(--color-flexoki-light-ui-3)',
                        '--tw-prose-quotes': 'var(--color-flexoki-light-tx)',
                        '--tw-prose-quote-borders': 'var(--color-flexoki-light-ui-3)',
                        '--tw-prose-captions': 'var(--color-flexoki-light-tx-2)',
                        '--tw-prose-code': 'var(--color-flexoki-light-ma)',
                        '--tw-prose-pre-code': 'var(--color-flexoki-light-ui)',
                        '--tw-prose-pre-bg': 'var(--color-flexoki-dark-ui)',
                        '--tw-prose-th-borders': 'var(--color-flexoki-light-ui-3)',
                        '--tw-prose-td-borders': 'var(--color-flexoki-light-ui-2)',

                        // Dark mode
                        '--tw-prose-invert-body': 'var(--color-flexoki-dark-tx)',
                        '--tw-prose-invert-headings': 'var(--color-flexoki-paper)',
                        '--tw-prose-invert-lead': 'var(--color-flexoki-dark-tx-2)',
                        '--tw-prose-invert-links': 'var(--color-flexoki-dark-cy)',
                        '--tw-prose-invert-bold': 'var(--color-flexoki-paper)',
                        '--tw-prose-invert-counters': 'var(--color-flexoki-dark-tx-2)',
                        '--tw-prose-invert-bullets': 'var(--color-flexoki-dark-tx-3)',
                        '--tw-prose-invert-hr': 'var(--color-flexoki-dark-ui-3)',
                        '--tw-prose-invert-quotes': 'var(--color-flexoki-dark-tx)',
                        '--tw-prose-invert-quote-borders': 'var(--color-flexoki-dark-ui-3)',
                        '--tw-prose-invert-captions': 'var(--color-flexoki-dark-tx-2)',
                        '--tw-prose-invert-code': 'var(--color-flexoki-dark-ma)',
                        '--tw-prose-invert-pre-code': 'var(--color-flexoki-dark-tx)',
                        '--tw-prose-invert-pre-bg': 'rgba(0, 0, 0, 0.5)',
                        '--tw-prose-invert-th-borders': 'var(--color-flexoki-dark-ui-3)',
                        '--tw-prose-invert-td-borders': 'var(--color-flexoki-dark-ui)'
                    },
                },
            }),
        },
    },
}
