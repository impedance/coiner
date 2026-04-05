import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { backupRepository } from '../db/repositories/BackupRepository';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

export function useExport() {
    const [loading, setLoading] = useState(false);

    const exportJSON = useCallback(async () => {
        setLoading(true);
        try {
            const data = await backupRepository.exportAll();
            const json = JSON.stringify(data, null, 2);
            const filename = `moneywork_backup_${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = `${(FileSystem as any).documentDirectory}${filename}`;

            await FileSystem.writeAsStringAsync(fileUri, json);
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            console.error('Export failed:', error);
            Alert.alert('Export Failed', 'An error occurred while creating the backup.');
        } finally {
            setLoading(false);
        }
    }, []);

    const exportCSV = useCallback(async () => {
        setLoading(true);
        try {
            const csv = await backupRepository.exportTransactionsCSV();
            const filename = `moneywork_transactions_${new Date().toISOString().split('T')[0]}.csv`;
            const fileUri = `${(FileSystem as any).documentDirectory}${filename}`;

            await FileSystem.writeAsStringAsync(fileUri, csv);
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            console.error('CSV Export failed:', error);
            Alert.alert('CSV Export Failed', 'An error occurred while creating the CSV export.');
        } finally {
            setLoading(false);
        }
    }, []);

    const importJSON = useCallback(async (onSuccess?: () => void) => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        setLoading(true);
        try {
            const fileUri = result.assets[0].uri;
            const content = await FileSystem.readAsStringAsync(fileUri);
            const data = JSON.parse(content);
            
            Alert.alert(
                'Import Data',
                'This will replace all current data. Are you sure?',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
                    { 
                        text: 'Import', 
                        style: 'destructive', 
                        onPress: async () => {
                            try {
                                await backupRepository.importAll(data);
                                Alert.alert('Success', 'Backup restored successfully!');
                                if (onSuccess) onSuccess();
                            } catch (e: unknown) {
                                console.error('Import processing failed:', e);
                                Alert.alert('Import Failed', 'Invalid backup file format.');
                            } finally {
                                setLoading(false);
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Import failed:', error);
            Alert.alert('Import Failed', 'Failed to read the file.');
            setLoading(false);
        }
    }, []);

    const resetData = useCallback(async (onSuccess?: () => void) => {
        Alert.alert(
            'CRITICAL: Reset Data',
            'This will permanently delete ALL accounts, transactions, goals, and cycles. There is no undo.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Confirm Reset', 
                    style: 'destructive', 
                    onPress: () => {
                        Alert.alert(
                            'Final Warning',
                            'Are you absolutely sure you want to delete everything?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { 
                                    text: 'Yes, Delete Everything', 
                                    style: 'destructive', 
                                    onPress: async () => {
                                        setLoading(true);
                                        try {
                                            await backupRepository.clearAllData();
                                            Alert.alert('Success', 'All local data has been cleared.');
                                            if (onSuccess) onSuccess();
                                        } catch (e) {
                                            console.error('Reset failed:', e);
                                            Alert.alert('Error', 'Failed to reset data.');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }
                                }
                            ]
                        );
                    }
                }
            ]
        );
    }, []);

    return {
        exportJSON,
        exportCSV,
        importJSON,
        resetData,
        loading,
    };
}
