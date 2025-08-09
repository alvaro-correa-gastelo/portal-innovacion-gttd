"use client"

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Target, Users, Settings2, CheckCircle, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SummaryData {
    problema_principal: string;
    objetivo_esperado: string;
    beneficiarios: string;
    departamento_solicitante: string;
    plataformas_involucradas: string[];
    plazo_deseado: string; // ej: "Entre 1 y 3 meses"
}

interface SummaryValidationCardProps {
    summary: SummaryData;
    onConfirm: () => void;
    onCorrect: () => void;
}

const iconVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
        scale: 1,
        opacity: 1,
        transition: {
            delay: i * 0.2,
            type: 'spring',
            stiffness: 260,
            damping: 20,
        },
    }),
};

const textVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.2 + 0.1,
        },
    }),
};

export function SummaryValidationCard({ summary, onConfirm, onCorrect }: SummaryValidationCardProps) {
    const plazoMapping: { [key: string]: string } = {
        'menos_1_mes': 'Menos de 1 mes',
        '1_a_3_meses': 'Entre 1 y 3 meses',
        '3_a_6_meses': 'Entre 3 y 6 meses',
        'sin_definir': 'Sin fecha definida',
    };

    const friendlyPlazo = plazoMapping[summary.plazo_deseado] || summary.plazo_deseado;

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4 border border-gray-200 dark:border-gray-700"
        >
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Resumen de tu Solicitud</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Por favor, valida que la información sea correcta.</p>
            </div>

            <hr className="dark:border-gray-700"/>

            <div className="space-y-5">
                {/* Sección Problema y Objetivo */}
                <div className="flex items-start space-x-4">
                    <motion.div custom={0} variants={iconVariants} className="flex-shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-lg p-2">
                        <Target size={20} />
                    </motion.div>
                    <motion.div custom={0} variants={textVariants} className="w-full">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Problema y Objetivo</h3>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm mt-1 space-y-1">
                            <li><span className="font-medium">Qué:</span> {summary.problema_principal}</li>
                            <li><span className="font-medium">Para qué:</span> {summary.objetivo_esperado}</li>
                        </ul>
                    </motion.div>
                </div>

                {/* Sección Impacto */}
                <div className="flex items-start space-x-4">
                    <motion.div custom={1} variants={iconVariants} className="flex-shrink-0 bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400 rounded-lg p-2">
                        <Users size={20} />
                    </motion.div>
                    <motion.div custom={1} variants={textVariants} className="w-full">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Impacto</h3>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm mt-1 space-y-1">
                            <li><span className="font-medium">Para quién:</span> {summary.beneficiarios}</li>
                            <li><span className="font-medium">Área:</span> {summary.departamento_solicitante}</li>
                        </ul>
                    </motion.div>
                </div>

                {/* Sección Detalles Técnicos */}
                <div className="flex items-start space-x-4">
                    <motion.div custom={2} variants={iconVariants} className="flex-shrink-0 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 rounded-lg p-2">
                        <Settings2 size={20} />
                    </motion.div>
                    <motion.div custom={2} variants={textVariants} className="w-full">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Detalles Técnicos</h3>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm mt-1 space-y-1">
                            <li><span className="font-medium">Sistemas:</span> {summary.plataformas_involucradas.join(', ')}</li>
                            <li><span className="font-medium">Plazo:</span> {friendlyPlazo}</li>
                        </ul>
                    </motion.div>
                </div>
            </div>

            <hr className="dark:border-gray-700"/>

            <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">Esta es una confirmación de la información recopilada. El equipo de GTTD la revisará para su evaluación interna.</p>
            </div>

            <div className="flex space-x-2 pt-2">
                <Button onClick={onConfirm} className="flex-1 bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark text-white">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar y Enviar
                </Button>
                <Button onClick={onCorrect} variant="outline" className="flex-1">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Necesito Corregir Algo
                </Button>
            </div>
        </motion.div>
    );
}
