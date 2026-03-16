################################################################################
# Automatically-generated file. Do not edit!
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../ra/fsp/src/bsp/mcu/ra6m3/bsp_linker.c 

C_DEPS += \
./ra/fsp/src/bsp/mcu/ra6m3/bsp_linker.d 

CREF += \
PWM1.cref 

OBJS += \
./ra/fsp/src/bsp/mcu/ra6m3/bsp_linker.o 

MAP += \
PWM1.map 


# Each subdirectory must supply rules for building sources it contributes
ra/fsp/src/bsp/mcu/ra6m3/%.o: ../ra/fsp/src/bsp/mcu/ra6m3/%.c
	@echo 'Building file: $<'
	$(file > $@.in,-mcpu=cortex-m4 -mthumb -mlittle-endian -mfloat-abi=hard -mfpu=fpv4-sp-d16 -O2 -ffunction-sections -fdata-sections -fno-strict-aliasing -fmessage-length=0 -funsigned-char -Wunused -Wuninitialized -Wall -Wextra -Wmissing-declarations -Wconversion -Wpointer-arith -Wshadow -Waggregate-return -Wno-parentheses-equality -Wfloat-equal -g3 -std=c99 -fshort-enums -fno-unroll-loops -I"D:\\ModularmProject\\Modularm_new_repo\\Modularm_BSP\\PWM1\\ra_gen" -I"." -I"D:\\ModularmProject\\Modularm_new_repo\\Modularm_BSP\\PWM1\\ra_cfg\\fsp_cfg\\bsp" -I"D:\\ModularmProject\\Modularm_new_repo\\Modularm_BSP\\PWM1\\ra_cfg\\fsp_cfg" -I"D:\\ModularmProject\\Modularm_new_repo\\Modularm_BSP\\PWM1\\src" -I"D:\\ModularmProject\\Modularm_new_repo\\Modularm_BSP\\PWM1\\ra\\fsp\\inc" -I"D:\\ModularmProject\\Modularm_new_repo\\Modularm_BSP\\PWM1\\ra\\fsp\\inc\\api" -I"D:\\ModularmProject\\Modularm_new_repo\\Modularm_BSP\\PWM1\\ra\\fsp\\inc\\instances" -I"D:\\ModularmProject\\Modularm_new_repo\\Modularm_BSP\\PWM1\\ra\\arm\\CMSIS_6\\CMSIS\\Core\\Include" -D_RENESAS_RA_ -D_RA_CORE=CM4 -D_RA_ORDINAL=1 -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" -x c "$<" -c -o "$@")
	@clang --target=arm-none-eabi @"$@.in"

