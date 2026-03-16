/*
* Copyright (c) 2020 - 2025 Renesas Electronics Corporation and/or its affiliates
*
* SPDX-License-Identifier: BSD-3-Clause
*/

#include "hal_data.h"

/*******************************************************************************************************************//**
 * @brief  PWM LED Dimming Demo
 *
 * This demo uses a GPT timer (g_timer0) to perform hardware PWM dimming on an LED.
 *
 * Note: For this to work on a physical LED, you must:
 * 1. Open the 'Pins' tab in the FSP configuration (configuration.xml).
 * 2. Configure a pin (e.g., P100 for Red LED on EK-RA6M3) as 'Peripheral -> GPT0 -> GTIOCA'.
 * 3. Open the 'Stacks' tab and ensure g_timer0 is configured for PWM mode with GTIOCA output enabled.
 **********************************************************************************************************************/
void hal_entry (void)
{
#if BSP_TZ_SECURE_BUILD
    /* Enter non-secure code */
    R_BSP_NonSecureEnter();
#endif

    fsp_err_t err;
    timer_info_t info;
    uint32_t duty_cycle = 0;
    bool breathing_up = true;

    /* Initialize the GPT timer module */
    err = g_timer0.p_api->open(g_timer0.p_ctrl, g_timer0.p_cfg);
    if (FSP_SUCCESS != err)
    {
        /* Trap if initialization fails */
        while(1);
    }

    /* Get the timer period to calculate duty cycle increments */
    err = g_timer0.p_api->infoGet(g_timer0.p_ctrl, &info);
    if (FSP_SUCCESS != err)
    {
        while(1);
    }

    /* Start the timer */
    err = g_timer0.p_api->start(g_timer0.p_ctrl);
    if (FSP_SUCCESS != err)
    {
        while(1);
    }

    uint32_t period = info.period_counts;
    uint32_t step = period / 100; // 1% steps

    while (1)
    {
        /* Update duty cycle for GTIOCB (pin index 1) */
        /* P100 on GPT Channel 5 is GTIOCB */
        g_timer0.p_api->dutyCycleSet(g_timer0.p_ctrl, duty_cycle, 1);

        /* Breathing logic: fade in then fade out */
        if (breathing_up)
        {
            duty_cycle += step;
            if (duty_cycle >= period)
            {
                duty_cycle = period;
                breathing_up = false;
            }
        }
        else
        {
            if (duty_cycle <= step)
            {
                duty_cycle = 0;
                breathing_up = true;
            }
            else
            {
                duty_cycle -= step;
            }
        }

        /* Delay to control the speed of the breathing effect */
        R_BSP_SoftwareDelay(10, BSP_DELAY_UNITS_MILLISECONDS);
    }
}
